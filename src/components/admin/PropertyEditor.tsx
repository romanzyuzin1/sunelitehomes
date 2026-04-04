import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  fetchPropertyById,
  createProperty,
  updatePropertyById,
  createEmptyProperty,
} from '../../lib/propertyService';
import {
  fetchAllContacts,
  getPropertyOwner,
  setPropertyOwner,
  fetchInterestsByProperty,
  addPropertyInterest,
  removePropertyInterest,
} from '../../lib/contactService';
import { getContactFullName, type Contact } from '../../data/contacts';
import type { PropertyInterest } from '../../data/contacts';
import type { Property } from '../../data/properties';
import {
  Save,
  ArrowLeft,
  Plus,
  X,
  Loader2,
  User,
  Users,
  Trash2,
  Upload,
  MapPin,
  FileText,
  Maximize2,
  Zap,
  Euro,
  Image as ImageIcon,
  Settings2,
  ChevronRight,
  CheckCircle2,
  Building2,
  AlertCircle,
} from 'lucide-react';
import { uploadPropertyImages, deletePropertyImage } from '../../lib/imageUpload';
import { EditorMap } from './EditorMap';

/* -- Section definitions -- */
const SECTIONS = [
  { id: 'direccion', label: 'Direcci\u00f3n', icon: MapPin },
  { id: 'datos', label: 'Datos b\u00e1sicos', icon: FileText },
  { id: 'descripcion', label: 'Comentarios generales', icon: FileText },
  { id: 'superficies', label: 'Superficies y Habitaciones', icon: Maximize2 },
  { id: 'caracteristicas', label: 'Caracter\u00edsticas', icon: Settings2 },
  { id: 'energia', label: 'Informaci\u00f3n energ\u00e9tica', icon: Zap },
  { id: 'apartamento', label: 'Apartamento', icon: Building2 },
  { id: 'precio', label: 'Precio', icon: Euro },
  { id: 'imagenes', label: 'Im\u00e1genes', icon: ImageIcon },
  { id: 'contactos', label: 'Contactos', icon: Users },
] as const;

type SectionId = (typeof SECTIONS)[number]['id'];

/* -- Reusable field helpers -- */
const inputCls =
  'w-full px-3 py-2 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold bg-white';
const inputErrorCls =
  'w-full px-3 py-2 border-2 border-red-400 rounded font-montserrat text-sm focus:outline-none focus:border-red-500 bg-red-50/30';
const labelCls = 'block font-montserrat text-sm text-gray-600 mb-1';
const sectionTitleCls =
  'font-montserrat text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4';

const COMMON_TAGS = [
  'Aire acondicionado', 'Ascensor', 'Terraza', 'Balcón', 'Garaje',
  'Trastero', 'Piscina comunitaria', 'Jardín', 'Chimenea',
  'Calefacción central', 'Suelo radiante', 'Domótica', 'Seguridad 24h',
  'Portero', 'Gimnasio', 'Zona infantil', 'Barbacoa', 'Video portero',
  'Armarios empotrados', 'Cocina equipada', 'Lavadero', 'Luminoso',
  'Exterior', 'Interior', 'Vistas al mar', 'Vistas a la montaña',
  'Sótano', 'Buhardilla', 'Amueblado', 'Parabólica', 'Pista de pádel',
  'Zona comunitaria', 'Conserje', 'Tenis', 'Sauna', 'Jacuzzi',
];

function LabelField({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div>
      <label className={error ? `${labelCls} text-red-600` : labelCls}>{label}</label>
      {children}
      {error && (
        <p className="flex items-center gap-1 font-montserrat text-xs text-red-500 mt-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}

function YesNoSelect({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <select
      value={value ? 'si' : 'no'}
      onChange={e => onChange(e.target.value === 'si')}
      className={inputCls}
    >
      <option value="no">No</option>
      <option value="si">S\u00ed</option>
    </select>
  );
}

/* ================================================================
   PropertyEditor - Engel & Volkers style with sidebar navigation
   ================================================================ */
export function PropertyEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'nueva';

  const [property, setProperty] = useState<Property>(createEmptyProperty);
  const [loading, setLoading] = useState(!isNew);
  const [newFeature, setNewFeature] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Navigation
  const [activeSection, setActiveSection] = useState<SectionId>('direccion');

  // Contacts state
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [ownerContactId, setOwnerContactId] = useState<number | null>(null);
  const [interests, setInterests] = useState<PropertyInterest[]>([]);
  const [addInterestId, setAddInterestId] = useState<string>('');
  const [addInterestLevel, setAddInterestLevel] =
    useState<PropertyInterest['interestLevel']>('medium');

  // Validation & success state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [createdPropertyId, setCreatedPropertyId] = useState<number | null>(null);

  const FIELD_SECTION: Record<string, SectionId> = {
    town: 'direccion',
    title: 'datos',
    price: 'precio',
  };

  const validateForm = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!property.title.trim()) errs.title = 'El título es obligatorio';
    if (property.price <= 0) errs.price = 'El precio debe ser mayor que 0';
    if (!property.town.trim()) errs.town = 'La población es obligatoria';
    return errs;
  };

  const sectionHasErrors = (sectionId: SectionId): boolean =>
    Object.entries(errors).some(([field]) => FIELD_SECTION[field] === sectionId);

  // Load existing property for edit mode
  useEffect(() => {
    if (isNew) return;
    let cancelled = false;
    setLoading(true);
    fetchPropertyById(Number(id)).then(p => {
      if (!cancelled) {
        setProperty(p ?? createEmptyProperty());
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [id, isNew]);

  // Load contacts + owner + interests
  useEffect(() => {
    fetchAllContacts()
      .then(setAllContacts)
      .catch(() => {});
    if (!isNew && id) {
      const pid = Number(id);
      getPropertyOwner(pid)
        .then(o => setOwnerContactId(o?.id ?? null))
        .catch(() => {});
      fetchInterestsByProperty(pid)
        .then(setInterests)
        .catch(() => {});
    }
  }, [id, isNew]);

  /* -- Field helpers -- */
  const updateField = <K extends keyof Property>(key: K, value: Property[K]) => {
    setProperty(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      // Navigate to the section with the first error
      const firstField = Object.keys(validationErrors)[0];
      const section = FIELD_SECTION[firstField];
      if (section) setActiveSection(section);
      return;
    }

    setSaving(true);
    try {
      const toSave = { ...property };
      if (!toSave.ref.trim()) {
        toSave.ref = `SEH-${Date.now().toString(36).toUpperCase()}`;
      }
      if (isNew) {
        const created = await createProperty(toSave);
        setSaved(true);
        setCreatedPropertyId(created.id);
      } else {
        await updatePropertyById(toSave.id, toSave);
        setProperty(toSave);
        setSaved(true);
      }
    } catch (err) {
      console.error('Error saving property:', err);
    } finally {
      setSaving(false);
    }
  };

  const addFeature = () => {
    const val = newFeature.trim();
    if (val && !property.features.includes(val)) {
      updateField('features', [...property.features, val]);
      setNewFeature('');
    }
  };

  const removeFeature = (feature: string) => {
    updateField(
      'features',
      property.features.filter(f => f !== feature),
    );
  };

  const addImage = () => {
    const val = newImageUrl.trim();
    if (val && !property.images.includes(val)) {
      updateField('images', [...property.images, val]);
      setNewImageUrl('');
    }
  };

  const removeImage = (url: string) => {
    updateField(
      'images',
      property.images.filter(i => i !== url),
    );
    deletePropertyImage(url).catch(() => {});
  };

  const handleFileUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(f => f.type.startsWith('image/') || /\.(heic|heif|jpg|jpeg|png|webp)$/i.test(f.name));
    if (fileArray.length === 0) return;
    setUploading(true);
    setUploadError(null);
    try {
      const urls = await uploadPropertyImages(fileArray, property.ref || 'tmp');
      if (urls.length > 0) {
        updateField('images', [...property.images, ...urls]);
      }
      if (urls.length < fileArray.length) {
        setUploadError(`${fileArray.length - urls.length} imagen(es) no se pudieron subir. Comprueba que el bucket "property-images" existe en Supabase Storage y tiene permisos públicos.`);
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setUploadError(err?.message || 'Error al subir las imágenes. Comprueba la configuración de Supabase Storage.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  /* -- Navigation helpers -- */
  const visibleSections = SECTIONS.filter(
    s => s.id !== 'contactos' || !isNew,
  );
  const currentIdx = visibleSections.findIndex(s => s.id === activeSection);
  const goNext = () => {
    if (currentIdx < visibleSections.length - 1) {
      setActiveSection(visibleSections[currentIdx + 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  const goPrev = () => {
    if (currentIdx > 0) {
      setActiveSection(visibleSections[currentIdx - 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /* -- Loading state -- */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
      </div>
    );
  }

  /* ================================
     SECTION RENDERERS
     ================================ */

  const renderDireccion = () => (
    <div className="space-y-4">
      <h2 className={sectionTitleCls}>Dirección</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <LabelField label="Población *" error={submitted ? errors.town : undefined}>
          <input
            type="text"
            value={property.town}
            onChange={e => {
              updateField('town', e.target.value);
              if (submitted) setErrors(prev => { const n = { ...prev }; delete n.town; return n; });
            }}
            className={submitted && errors.town ? inputErrorCls : inputCls}
            placeholder="Ej: Madrid"
          />
        </LabelField>
        <LabelField label="Provincia">
          <input
            type="text"
            value={property.province}
            onChange={e => updateField('province', e.target.value)}
            className={inputCls}
            placeholder="Ej: Madrid"
          />
        </LabelField>
        <LabelField label="Código Postal">
          <input
            type="text"
            value={property.postcode}
            onChange={e => updateField('postcode', e.target.value)}
            className={inputCls}
            placeholder="Ej: 28001"
          />
        </LabelField>
        <div className="lg:col-span-2">
          <LabelField label="Dirección">
            <input
              type="text"
              value={property.location.address}
              onChange={e =>
                updateField('location', {
                  ...property.location,
                  address: e.target.value,
                })
              }
              className={inputCls}
              placeholder="Ej: Calle Gran Vía, 123"
            />
          </LabelField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <LabelField label="Latitud">
            <input
              type="number"
              step="any"
              value={property.location.latitude ?? ''}
              onChange={e =>
                updateField('location', {
                  ...property.location,
                  latitude: e.target.value ? parseFloat(e.target.value) : null,
                })
              }
              className={inputCls}
            />
          </LabelField>
          <LabelField label="Longitud">
            <input
              type="number"
              step="any"
              value={property.location.longitude ?? ''}
              onChange={e =>
                updateField('location', {
                  ...property.location,
                  longitude: e.target.value ? parseFloat(e.target.value) : null,
                })
              }
              className={inputCls}
            />
          </LabelField>
        </div>
      </div>
      <EditorMap
        latitude={property.location.latitude}
        longitude={property.location.longitude}
        address={property.location.address}
        town={property.town}
        province={property.province}
        onCoordsChange={(lat, lng) =>
          updateField('location', {
            ...property.location,
            latitude: lat,
            longitude: lng,
          })
        }
      />
    </div>
  );

  const renderDatosBasicos = () => (
    <div className="space-y-4">
      <h2 className={sectionTitleCls}>Datos básicos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <LabelField label="Título *" error={submitted ? errors.title : undefined}>
            <input
              type="text"
              required
              value={property.title}
              onChange={e => {
                updateField('title', e.target.value);
                if (submitted) setErrors(prev => { const n = { ...prev }; delete n.title; return n; });
              }}
              className={submitted && errors.title ? inputErrorCls : inputCls}
              placeholder="Ej: Hermoso Apartamento en el Centro de Madrid"
            />
          </LabelField>
        </div>
        <LabelField label="Referencia">
          <input
            type="text"
            value={property.ref}
            onChange={e => updateField('ref', e.target.value)}
            className={inputCls}
            placeholder="Auto-generada si se deja vacío"
          />
        </LabelField>
        <LabelField label="Tipo">
          <select
            value={property.type}
            onChange={e => updateField('type', e.target.value)}
            className={inputCls}
          >
            {[
              'Casa', 'Piso', '\u00c1tico', 'Chalet', 'Villa',
              'D\u00faplex', 'Estudio', 'Local', 'Terreno', 'Oficina', 'Nave',
            ].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </LabelField>
        <LabelField label="Estado">
          <select
            value={property.status}
            onChange={e => updateField('status', e.target.value)}
            className={inputCls}
          >
            {['disponible', 'reservado', 'vendido', 'alquilado'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </LabelField>
        <LabelField label="Año Construcción">
          <input
            type="number"
            value={property.buildYear || ''}
            onChange={e =>
              updateField('buildYear', e.target.value ? parseInt(e.target.value) : null)
            }
            className={inputCls}
            placeholder="Ej: 2005"
          />
        </LabelField>
      </div>
    </div>
  );

  const renderDescripcion = () => (
    <div className="space-y-4">
      <h2 className={sectionTitleCls}>Comentarios generales</h2>
      <textarea
        value={property.description}
        onChange={e => updateField('description', e.target.value)}
        rows={10}
        className={`${inputCls} resize-y`}
        placeholder="Describe el inmueble en detalle..."
      />
    </div>
  );

  const renderSuperficies = () => (
    <div className="space-y-6">
      <h2 className={sectionTitleCls}>Superficies y Habitaciones</h2>

      {/* Surfaces */}
      <div>
        <h3 className="font-montserrat text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
          Superficies (m²)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <LabelField label="Superficie construida">
            <input
              type="text"
              inputMode="numeric"
              value={property.surfaceArea.built || ''}
              onChange={e =>
                updateField('surfaceArea', {
                  ...property.surfaceArea,
                  built: parseInt(e.target.value) || 0,
                })
              }
              className={inputCls}
            />
          </LabelField>
          <LabelField label="Superficie habitable">
            <input
              type="text"
              inputMode="numeric"
              value={property.surfaceArea.habitable || ''}
              onChange={e =>
                updateField('surfaceArea', {
                  ...property.surfaceArea,
                  habitable: parseInt(e.target.value) || 0,
                })
              }
              className={inputCls}
            />
          </LabelField>
          <LabelField label="Superficie útil">
            <input
              type="text"
              inputMode="numeric"
              value={property.surfaceArea.usable || ''}
              onChange={e =>
                updateField('surfaceArea', {
                  ...property.surfaceArea,
                  usable: parseInt(e.target.value) || 0,
                })
              }
              className={inputCls}
            />
          </LabelField>
          <LabelField label="Superficie del terreno">
            <input
              type="text"
              inputMode="numeric"
              value={property.surfaceArea.plot || ''}
              onChange={e =>
                updateField('surfaceArea', {
                  ...property.surfaceArea,
                  plot: parseInt(e.target.value) || 0,
                })
              }
              className={inputCls}
            />
          </LabelField>
        </div>
      </div>

      {/* Rooms */}
      <div>
        <h3 className="font-montserrat text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
          Habitaciones
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <LabelField label="Nª habitaciones">
            <input
              type="text"
              inputMode="numeric"
              value={property.rooms || ''}
              onChange={e => updateField('rooms', parseInt(e.target.value) || 0)}
              className={inputCls}
            />
          </LabelField>
          <LabelField label="Dormitorios">
            <input
              type="text"
              inputMode="numeric"
              value={property.beds || ''}
              onChange={e => updateField('beds', parseInt(e.target.value) || 0)}
              className={inputCls}
            />
          </LabelField>
          <LabelField label="Baños">
            <input
              type="text"
              inputMode="numeric"
              value={property.baths || ''}
              onChange={e => updateField('baths', parseInt(e.target.value) || 0)}
              className={inputCls}
            />
          </LabelField>
          <LabelField label="Baños principales">
            <input
              type="text"
              inputMode="numeric"
              value={property.ensuiteBaths || ''}
              onChange={e => updateField('ensuiteBaths', parseInt(e.target.value) || 0)}
              className={inputCls}
            />
          </LabelField>
        </div>
      </div>

      {/* Extras */}
      <div>
        <h3 className="font-montserrat text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
          Extras
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <LabelField label="Patio">
            <YesNoSelect value={property.hasPatio ?? false} onChange={v => updateField('hasPatio', v)} />
          </LabelField>
          <LabelField label="Estudio independiente">
            <YesNoSelect value={property.hasStudio ?? false} onChange={v => updateField('hasStudio', v)} />
          </LabelField>
          <LabelField label="Cuarto de servicio">
            <YesNoSelect value={property.hasServiceRoom ?? false} onChange={v => updateField('hasServiceRoom', v)} />
          </LabelField>
        </div>
      </div>
    </div>
  );

  const renderCaracteristicas = () => (
    <div className="space-y-6">
      <h2 className={sectionTitleCls}>Características</h2>

      {/* Toggle properties */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <LabelField label="Piscina">
          <YesNoSelect value={property.pool} onChange={v => updateField('pool', v)} />
        </LabelField>
        <LabelField label="Ascensor">
          <YesNoSelect value={property.hasLift ?? false} onChange={v => updateField('hasLift', v)} />
        </LabelField>
        <LabelField label="Plazas de garaje">
          <input
            type="text"
            inputMode="numeric"
            value={property.parkingSpaces || ''}
            onChange={e => updateField('parkingSpaces', parseInt(e.target.value) || 0)}
            className={inputCls}
          />
        </LabelField>
      </div>

      {/* Features tags with common suggestions */}
      <div>
        <h3 className="font-montserrat text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
          Etiquetas adicionales
        </h3>

        {/* Selected tags */}
        {property.features.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {property.features.map(feature => (
              <span
                key={feature}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-gold/10 text-brand-navy font-montserrat text-sm rounded-full"
              >
                {feature}
                <button
                  type="button"
                  onClick={() => removeFeature(feature)}
                  className="text-gray-400 hover:text-red-500 ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Common tags grid */}
        <p className="font-montserrat text-xs text-gray-400 mb-2">Etiquetas comunes (clic para añadir/quitar)</p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {COMMON_TAGS.map(tag => {
            const isSelected = property.features.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    removeFeature(tag);
                  } else {
                    updateField('features', [...property.features, tag]);
                  }
                }}
                className={`px-2.5 py-1 rounded-full font-montserrat text-xs transition-colors ${
                  isSelected
                    ? 'bg-brand-gold text-brand-navy font-semibold'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                }`}
              >
                {isSelected ? '✓ ' : '+ '}{tag}
              </button>
            );
          })}
        </div>

        {/* Custom tag input */}
        <p className="font-montserrat text-xs text-gray-400 mb-1">O añadir etiqueta personalizada</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={newFeature}
            onChange={e => setNewFeature(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addFeature();
              }
            }}
            className={`flex-1 ${inputCls}`}
            placeholder="Escribir etiqueta personalizada..."
          />
          <button
            type="button"
            onClick={addFeature}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded font-montserrat text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderEnergia = () => (
    <div className="space-y-4">
      <h2 className={sectionTitleCls}>Información energética</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LabelField label="Certificación Energética (Consumo)">
          <select
            value={property.energyRating.consumption}
            onChange={e =>
              updateField('energyRating', {
                ...property.energyRating,
                consumption: e.target.value,
              })
            }
            className={inputCls}
          >
            {['none', 'a', 'b', 'c', 'd', 'e', 'f', 'g'].map(v => (
              <option key={v} value={v}>
                {v === 'none' ? 'Sin certificar' : v.toUpperCase()}
              </option>
            ))}
          </select>
        </LabelField>
        <LabelField label="Certificación Energética (Emisiones)">
          <select
            value={property.energyRating.emissions}
            onChange={e =>
              updateField('energyRating', {
                ...property.energyRating,
                emissions: e.target.value,
              })
            }
            className={inputCls}
          >
            {['none', 'a', 'b', 'c', 'd', 'e', 'f', 'g'].map(v => (
              <option key={v} value={v}>
                {v === 'none' ? 'Sin certificar' : v.toUpperCase()}
              </option>
            ))}
          </select>
        </LabelField>
      </div>

      {/* Energy color bars visual */}
      <div className="flex gap-1 mt-2">
        {[
          { letter: 'A', color: '#00a651' },
          { letter: 'B', color: '#4cb848' },
          { letter: 'C', color: '#b9d432' },
          { letter: 'D', color: '#fff200' },
          { letter: 'E', color: '#f7a825' },
          { letter: 'F', color: '#f15a29' },
          { letter: 'G', color: '#ed1c24' },
        ].map(en => {
          const isActive =
            property.energyRating.consumption.toLowerCase() ===
            en.letter.toLowerCase();
          return (
            <div
              key={en.letter}
              className={`flex items-center justify-center text-white font-montserrat text-xs font-bold rounded transition-all ${
                isActive ? 'flex-[2] py-2' : 'flex-1 py-1 opacity-50'
              }`}
              style={{ backgroundColor: en.color }}
            >
              {en.letter}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderApartamento = () => (
    <div className="space-y-4">
      <h2 className={sectionTitleCls}>Apartamento</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <LabelField label="Planta">
          <input
            type="text"
            value={property.floor}
            onChange={e => updateField('floor', e.target.value)}
            className={inputCls}
            placeholder="Ej: 3ª"
          />
        </LabelField>
        <LabelField label="Orientación">
          <select
            value={property.orientation}
            onChange={e => updateField('orientation', e.target.value)}
            className={inputCls}
          >
            <option value="">— Sin especificar —</option>
            <option value="norte">Norte</option>
            <option value="sur">Sur</option>
            <option value="este">Este</option>
            <option value="oeste">Oeste</option>
            <option value="noreste">Noreste</option>
            <option value="noroeste">Noroeste</option>
            <option value="sureste">Sureste</option>
            <option value="suroeste">Suroeste</option>
          </select>
        </LabelField>
        <LabelField label="Calefacción">
          <select
            value={property.heatingType}
            onChange={e => updateField('heatingType', e.target.value)}
            className={inputCls}
          >
            <option value="">— Sin especificar —</option>
            <option value="central">Central</option>
            <option value="individual_gas">Individual Gas</option>
            <option value="individual_electrico">Individual Eléctrico</option>
            <option value="bomba_calor">Bomba de calor</option>
            <option value="suelo_radiante">Suelo radiante</option>
            <option value="sin_calefaccion">Sin calefacción</option>
          </select>
        </LabelField>
        <LabelField label="Amueblado">
          <select
            value={property.furnished}
            onChange={e => updateField('furnished', e.target.value)}
            className={inputCls}
          >
            <option value="">— Sin especificar —</option>
            <option value="amueblado">Amueblado</option>
            <option value="semi_amueblado">Semi-amueblado</option>
            <option value="sin_amueblar">Sin amueblar</option>
          </select>
        </LabelField>
      </div>
    </div>
  );

  const renderPrecio = () => (
    <div className="space-y-4">
      <h2 className={sectionTitleCls}>Precio</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <LabelField label="Precio *" error={submitted ? errors.price : undefined}>
          <input
            type="text"
            inputMode="numeric"
            required
            value={property.price || ''}
            onChange={e => {
              updateField('price', parseInt(e.target.value) || 0);
              if (submitted) setErrors(prev => { const n = { ...prev }; delete n.price; return n; });
            }}
            className={submitted && errors.price ? inputErrorCls : inputCls}
          />
        </LabelField>
        <LabelField label="Moneda">
          <select
            value={property.currency}
            onChange={e => updateField('currency', e.target.value)}
            className={inputCls}
          >
            <option value="EUR">EUR (€)</option>
            <option value="USD">USD ($)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </LabelField>
        <LabelField label="Operación">
          <select
            value={property.priceFreq}
            onChange={e =>
              updateField('priceFreq', e.target.value as 'sale' | 'month')
            }
            className={inputCls}
          >
            <option value="sale">Venta</option>
            <option value="month">Alquiler Mensual</option>
          </select>
        </LabelField>
      </div>

      {/* Price display preview */}
      {property.price > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <p className="font-montserrat text-xs text-gray-400 mb-1">Vista previa</p>
          <p className="font-montserrat text-2xl font-semibold text-brand-navy">
            {new Intl.NumberFormat('es-ES', {
              style: 'currency',
              currency: property.currency || 'EUR',
              maximumFractionDigits: 0,
            }).format(property.price)}
            {property.priceFreq === 'month' && (
              <span className="text-sm font-normal text-gray-400"> /mes</span>
            )}
          </p>
        </div>
      )}
    </div>
  );

  const renderImagenes = () => (
    <div className="space-y-4">
      <h2 className={sectionTitleCls}>
        Imágenes ({property.images.length})
      </h2>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver
            ? 'border-brand-gold bg-brand-gold/5'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
            <p className="font-montserrat text-sm text-gray-500">
              Subiendo imágenes…
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-gray-300" />
            <p className="font-montserrat text-sm text-gray-500">
              Arrastra fotos aquí o{' '}
              <label className="text-brand-gold cursor-pointer hover:underline">
                selecciona archivos
                <input
                  type="file"
                  multiple
                  accept="image/*,.heic,.heif,.HEIC,.HEIF"
                  className="hidden"
                  onChange={e => {
                    if (e.target.files) handleFileUpload(e.target.files);
                    e.target.value = '';
                  }}
                />
              </label>
            </p>
            <p className="font-montserrat text-xs text-gray-400">
              JPG, PNG, WebP — máx. 10 MB por archivo
            </p>
          </div>
        )}
      </div>

      {/* Upload error alert */}
      {uploadError && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-montserrat text-sm text-red-700 font-medium">Error al subir imágenes</p>
            <p className="font-montserrat text-xs text-red-600 mt-1">{uploadError}</p>
          </div>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="text-red-400 hover:text-red-600 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Image grid */}
      {property.images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {property.images.map((url, i) => (
            <div
              key={i}
              className="relative group aspect-[4/3] bg-gray-100 rounded overflow-hidden"
            >
              <img
                src={url}
                alt={`Imagen ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              {i === 0 && (
                <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-brand-gold text-brand-navy text-xs font-montserrat font-semibold rounded">
                  Principal
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* URL manual input */}
      <details className="group">
        <summary className="font-montserrat text-xs text-gray-400 cursor-pointer hover:text-gray-600 mb-2">
          O añadir imagen por URL…
        </summary>
        <div className="flex gap-2 mt-2">
          <input
            type="url"
            value={newImageUrl}
            onChange={e => setNewImageUrl(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addImage();
              }
            }}
            className={`flex-1 ${inputCls}`}
            placeholder="https://ejemplo.com/imagen.jpg"
          />
          <button
            type="button"
            onClick={addImage}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded font-montserrat text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </details>
    </div>
  );

  const renderContactos = () => (
    <div className="space-y-6">
      {/* Owner */}
      <div>
        <h2 className={`flex items-center gap-2 ${sectionTitleCls}`}>
          <User className="w-4 h-4" /> Propietario
        </h2>
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <select
              value={ownerContactId ?? ''}
              onChange={async e => {
                const cid = e.target.value ? Number(e.target.value) : null;
                setOwnerContactId(cid);
                try {
                  await setPropertyOwner(property.id, cid);
                } catch (err) {
                  console.error('Error setting owner:', err);
                }
              }}
              className={inputCls}
            >
              <option value="">— Sin propietario —</option>
              {allContacts
                .filter(c => c.isOwner)
                .map(c => (
                  <option key={c.id} value={c.id}>
                    {getContactFullName(c)} {c.phone ? `(${c.phone})` : ''}
                  </option>
                ))}
            </select>
          </div>
          {ownerContactId && (
            <Link
              to={`/admin/contactos/${ownerContactId}/detalle`}
              className="px-3 py-2 bg-brand-gold/10 text-brand-gold hover:bg-brand-gold/20 rounded font-montserrat text-xs transition-colors whitespace-nowrap font-semibold"
            >
              Ver ficha
            </Link>
          )}
          <Link
            to="/admin/contactos/nuevo"
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded font-montserrat text-xs transition-colors whitespace-nowrap"
          >
            + Nuevo contacto
          </Link>
        </div>
      </div>

      {/* Interests */}
      <div>
        <h2 className={`flex items-center gap-2 ${sectionTitleCls}`}>
          <Users className="w-4 h-4" /> Interesados
        </h2>

        {interests.length > 0 && (
          <div className="space-y-2 mb-4">
            {interests.map(interest => {
              const c = allContacts.find(x => x.id === interest.contactId);
              return (
                <div
                  key={interest.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded"
                >
                  <div className="flex-1 min-w-0">
                    <span className="font-montserrat text-sm font-medium text-gray-800">
                      {c ? getContactFullName(c) : `Contacto #${interest.contactId}`}
                    </span>
                    <span
                      className={`ml-2 px-2 py-0.5 rounded text-xs font-montserrat ${
                        interest.interestLevel === 'high'
                          ? 'bg-green-100 text-green-700'
                          : interest.interestLevel === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {interest.interestLevel === 'high'
                        ? 'Alto'
                        : interest.interestLevel === 'medium'
                          ? 'Medio'
                          : 'Bajo'}
                    </span>
                    {interest.notes && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {interest.notes}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await removePropertyInterest(interest.id);
                        setInterests(prev =>
                          prev.filter(i => i.id !== interest.id),
                        );
                      } catch (err) {
                        console.error('Error removing interest:', err);
                      }
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Add interest */}
        <div className="flex gap-2 items-end flex-wrap">
          <div className="flex-1 min-w-[160px]">
            <label className="block font-montserrat text-xs text-gray-500 mb-1">
              Contacto
            </label>
            <select
              value={addInterestId}
              onChange={e => setAddInterestId(e.target.value)}
              className={inputCls}
            >
              <option value="">— Seleccionar —</option>
              {allContacts
                .filter(
                  c =>
                    c.isBuyer &&
                    !interests.some(i => i.contactId === c.id),
                )
                .map(c => (
                  <option key={c.id} value={c.id}>
                    {getContactFullName(c)}
                  </option>
                ))}
            </select>
          </div>
          <div className="w-28">
            <label className="block font-montserrat text-xs text-gray-500 mb-1">
              Interés
            </label>
            <select
              value={addInterestLevel}
              onChange={e =>
                setAddInterestLevel(
                  e.target.value as PropertyInterest['interestLevel'],
                )
              }
              className={inputCls}
            >
              <option value="low">Bajo</option>
              <option value="medium">Medio</option>
              <option value="high">Alto</option>
            </select>
          </div>
          <button
            type="button"
            disabled={!addInterestId}
            onClick={async () => {
              if (!addInterestId) return;
              try {
                const created = await addPropertyInterest(
                  property.id,
                  Number(addInterestId),
                  addInterestLevel,
                );
                setInterests(prev => [...prev, created]);
                setAddInterestId('');
              } catch (err) {
                console.error('Error adding interest:', err);
              }
            }}
            className="px-4 py-2 bg-brand-gold text-brand-navy font-montserrat text-sm font-medium rounded hover:bg-brand-gold/90 transition-colors disabled:opacity-50"
          >
            Añadir
          </button>
        </div>
      </div>
    </div>
  );

  /* -- Section content router -- */
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'direccion':
        return renderDireccion();
      case 'datos':
        return renderDatosBasicos();
      case 'descripcion':
        return renderDescripcion();
      case 'superficies':
        return renderSuperficies();
      case 'caracteristicas':
        return renderCaracteristicas();
      case 'energia':
        return renderEnergia();
      case 'apartamento':
        return renderApartamento();
      case 'precio':
        return renderPrecio();
      case 'imagenes':
        return renderImagenes();
      case 'contactos':
        return renderContactos();
      default:
        return null;
    }
  };

  /* ================================================================
     MAIN RENDER - Sidebar + Content
     ================================================================ */
  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={() => navigate('/admin/dashboard')}
          className="text-gray-400 hover:text-gray-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-playfair text-2xl text-gray-800 font-semibold">
            {isNew ? 'Nuevo Inmueble' : 'Editar Inmueble'}
          </h1>
          {!isNew && (
            <p className="font-montserrat text-sm text-gray-500">
              Ref: {property.ref} · ID: {property.id}
            </p>
          )}
        </div>
        {saved && (
          <span className="font-montserrat text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Guardado
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex gap-6">
          {/* -- LEFT SIDEBAR -- */}
          <div className="w-56 shrink-0 hidden md:block">
            <nav className="bg-white rounded-lg shadow-sm overflow-hidden sticky top-4">
              {visibleSections.map((section) => {
                const Icon = section.icon;
                const isActive = section.id === activeSection;
                const hasError = submitted && sectionHasErrors(section.id);
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left font-montserrat text-sm transition-colors border-l-[3px] ${
                      hasError
                        ? isActive
                          ? 'bg-red-50 border-l-red-500 text-red-700 font-medium'
                          : 'border-l-transparent text-red-500 hover:text-red-600 hover:bg-red-50'
                        : isActive
                          ? 'bg-brand-gold/5 border-l-brand-gold text-brand-navy font-medium'
                          : 'border-l-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate flex-1">{section.label}</span>
                    {hasError && (
                      <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Quick progress */}
            <div className="mt-4 bg-white rounded-lg shadow-sm p-4">
              <p className="font-montserrat text-xs text-gray-400 mb-2">
                Progreso
              </p>
              <div className="flex flex-col gap-1.5">
                {[
                  { label: 'T\u00edtulo', ok: !!property.title.trim() },
                  { label: 'Precio', ok: property.price > 0 },
                  { label: 'Ubicaci\u00f3n', ok: !!property.town.trim() },
                  { label: 'Im\u00e1genes', ok: property.images.length > 0 },
                  { label: 'Descripci\u00f3n', ok: !!property.description.trim() },
                ].map(item => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 font-montserrat text-xs"
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        item.ok ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                    <span className={item.ok ? 'text-gray-600' : 'text-gray-400'}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* -- MAIN CONTENT -- */}
          <div className="flex-1 min-w-0">
            {/* Mobile section picker */}
            <div className="md:hidden mb-4">
              <select
                value={activeSection}
                onChange={e => setActiveSection(e.target.value as SectionId)}
                className={inputCls}
              >
                {visibleSections.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Section content */}
            <div className="bg-white p-6 shadow-sm rounded-lg min-h-[400px]">
              {renderActiveSection()}
            </div>

            {/* Navigation + Submit buttons */}
            <div className="flex items-center justify-between mt-6">
              <div>
                {currentIdx > 0 && (
                  <button
                    type="button"
                    onClick={goPrev}
                    className="flex items-center gap-1 px-4 py-2.5 font-montserrat text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {visibleSections[currentIdx - 1].label}
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/admin/dashboard')}
                  className="px-5 py-2.5 font-montserrat text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded transition-colors"
                >
                  Cancelar
                </button>

                {currentIdx < visibleSections.length - 1 && (
                  <button
                    type="button"
                    onClick={goNext}
                    className="flex items-center gap-1 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-montserrat text-sm font-medium rounded transition-colors"
                  >
                    Continuar
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-brand-gold text-brand-navy font-montserrat text-sm font-semibold hover:bg-brand-gold/90 rounded transition-colors disabled:opacity-70"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Success overlay after creating a new property */}
      {createdPropertyId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full mx-4 text-center animate-in fade-in zoom-in duration-300">
            {/* Animated checkmark */}
            <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>

            <h2 className="font-playfair text-2xl font-semibold text-gray-800 mb-2">
              ¡Propiedad creada!
            </h2>
            <p className="font-montserrat text-sm text-gray-500 mb-8">
              El inmueble se ha guardado correctamente con referencia{' '}
              <span className="font-semibold text-brand-navy">{property.ref}</span>.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => navigate(`/admin/propiedades/${createdPropertyId}`)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-gold text-brand-navy font-montserrat text-sm font-semibold rounded-lg hover:bg-brand-gold/90 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Ver propiedad
              </button>
              <button
                type="button"
                onClick={() => {
                  setProperty(createEmptyProperty());
                  setCreatedPropertyId(null);
                  setSubmitted(false);
                  setErrors({});
                  setSaved(false);
                  setActiveSection('direccion');
                  setOwnerContactId(null);
                  setInterests([]);
                }}
                className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 font-montserrat text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Crear otra
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
