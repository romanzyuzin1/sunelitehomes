import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  fetchPropertyById,
  createProperty,
  updatePropertyById,
  createEmptyProperty,
} from '../../lib/propertyService';
import type { Property } from '../../data/properties';
import { Save, ArrowLeft, Plus, X, Image as ImageIcon, Loader2 } from 'lucide-react';

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
    return () => { cancelled = true; };
  }, [id, isNew]);

  const updateField = <K extends keyof Property>(key: K, value: Property[K]) => {
    setProperty(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isNew) {
        const created = await createProperty(property);
        setSaved(true);
        navigate(`/admin/propiedades/${created.id}`, { replace: true });
      } else {
        await updatePropertyById(property.id, property);
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
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
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
          <span className="font-montserrat text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded">
            ✓ Guardado
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* ── Basic Info ── */}
          <div className="bg-white p-6 shadow-sm rounded-lg">
            <h2 className="font-montserrat text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
              Información Básica
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <label className="block font-montserrat text-sm text-gray-600 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  required
                  value={property.title}
                  onChange={e => updateField('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold"
                  placeholder="Ej: Hermoso Apartamento en el Centro de Madrid"
                />
              </div>
              <div>
                <label className="block font-montserrat text-sm text-gray-600 mb-1">
                  Referencia *
                </label>
                <input
                  type="text"
                  required
                  value={property.ref}
                  onChange={e => updateField('ref', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold"
                  placeholder="Ej: 00077"
                />
              </div>
              <div>
                <label className="block font-montserrat text-sm text-gray-600 mb-1">
                  Tipo
                </label>
                <select
                  value={property.type}
                  onChange={e => updateField('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold"
                >
                  {[
                    'Casa', 'Piso', 'Ático', 'Chalet', 'Villa',
                    'Dúplex', 'Estudio', 'Local', 'Terreno', 'Oficina', 'Nave',
                  ].map(t => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-montserrat text-sm text-gray-600 mb-1">
                  Estado
                </label>
                <select
                  value={property.status}
                  onChange={e => updateField('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold"
                >
                  {['disponible', 'reservado', 'vendido', 'alquilado'].map(
                    s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ),
                  )}
                </select>
              </div>
              <div>
                <label className="block font-montserrat text-sm text-gray-600 mb-1">
                  Año Construcción
                </label>
                <input
                  type="number"
                  value={property.buildYear || ''}
                  onChange={e =>
                    updateField(
                      'buildYear',
                      e.target.value ? parseInt(e.target.value) : null,
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold"
                  placeholder="Ej: 2005"
                />
              </div>
            </div>
          </div>

          {/* ── Pricing ── */}
          <div className="bg-white p-6 shadow-sm rounded-lg">
            <h2 className="font-montserrat text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
              Precio
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-montserrat text-sm text-gray-600 mb-1">
                  Precio *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={property.price}
                  onChange={e =>
                    updateField('price', parseInt(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold"
                />
              </div>
              <div>
                <label className="block font-montserrat text-sm text-gray-600 mb-1">
                  Moneda
                </label>
                <select
                  value={property.currency}
                  onChange={e => updateField('currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold"
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
              <div>
                <label className="block font-montserrat text-sm text-gray-600 mb-1">
                  Operación
                </label>
                <select
                  value={property.priceFreq}
                  onChange={e =>
                    updateField(
                      'priceFreq',
                      e.target.value as 'sale' | 'month',
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold"
                >
                  <option value="sale">Venta</option>
                  <option value="month">Alquiler Mensual</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── Location ── */}
          <div className="bg-white p-6 shadow-sm rounded-lg">
            <h2 className="font-montserrat text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
              Ubicación
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block font-montserrat text-sm text-gray-600 mb-1">
                  Población
                </label>
                <input
                  type="text"
                  value={property.town}
                  onChange={e => updateField('town', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold"
                  placeholder="Ej: Madrid"
                />
              </div>
              <div>
                <label className="block font-montserrat text-sm text-gray-600 mb-1">
                  Provincia
                </label>
                <input
                  type="text"
                  value={property.province}
                  onChange={e => updateField('province', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold"
                  placeholder="Ej: Madrid"
                />
              </div>
              <div>
                <label className="block font-montserrat text-sm text-gray-600 mb-1">
                  Código Postal
                </label>
                <input
                  type="text"
                  value={property.postcode}
                  onChange={e => updateField('postcode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold"
                  placeholder="Ej: 28001"
                />
              </div>
              <div className="lg:col-span-2">
                <label className="block font-montserrat text-sm text-gray-600 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  value={property.location.address}
                  onChange={e =>
                    updateField('location', {
                      ...property.location,
                      address: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold"
                  placeholder="Ej: Calle Gran Vía, 123"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-montserrat text-sm text-gray-600 mb-1">
                    Latitud
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={property.location.latitude ?? ''}
                    onChange={e =>
                      updateField('location', {
                        ...property.location,
                        latitude: e.target.value
                          ? parseFloat(e.target.value)
                          : null,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold"
                  />
                </div>
                <div>
                  <label className="block font-montserrat text-sm text-gray-600 mb-1">
                    Longitud
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={property.location.longitude ?? ''}
                    onChange={e =>
                      updateField('location', {
                        ...property.location,
                        longitude: e.target.value
                          ? parseFloat(e.target.value)
                          : null,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Details ── */}
          <div className="bg-white p-6 shadow-sm rounded-lg">
            <h2 className="font-montserrat text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
              Detalles
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="block font-montserrat text-sm text-gray-600 mb-1">
                  Dormitorios
                </label>
                <input
                  type="number"
                  min="0"
                  value={property.beds}
                  onChange={e =>
                    updateField('beds', parseInt(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold"
                />
              </div>
              <div>
                <label className="block font-montserrat text-sm text-gray-600 mb-1">
                  Baños
                </label>
                <input
                  type="number"
                  min="0"
                  value={property.baths}
                  onChange={e =>
                    updateField('baths', parseInt(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold"
                />
              </div>
              <div>
                <label className="block font-montserrat text-sm text-gray-600 mb-1">
                  m² Construidos
                </label>
                <input
                  type="number"
                  min="0"
                  value={property.surfaceArea.built}
                  onChange={e =>
                    updateField('surfaceArea', {
                      ...property.surfaceArea,
                      built: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold"
                />
              </div>
              <div>
                <label className="block font-montserrat text-sm text-gray-600 mb-1">
                  m² Parcela
                </label>
                <input
                  type="number"
                  min="0"
                  value={property.surfaceArea.plot}
                  onChange={e =>
                    updateField('surfaceArea', {
                      ...property.surfaceArea,
                      plot: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold"
                />
              </div>
              <div>
                <label className="block font-montserrat text-sm text-gray-600 mb-1">
                  Piscina
                </label>
                <select
                  value={property.pool ? 'si' : 'no'}
                  onChange={e => updateField('pool', e.target.value === 'si')}
                  className="w-full px-3 py-2 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold"
                >
                  <option value="no">No</option>
                  <option value="si">Sí</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block font-montserrat text-sm text-gray-600 mb-1">
                  Certificación Energética
                </label>
                <select
                  value={property.energyRating.consumption}
                  onChange={e =>
                    updateField('energyRating', {
                      ...property.energyRating,
                      consumption: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold"
                >
                  {['none', 'a', 'b', 'c', 'd', 'e', 'f', 'g'].map(v => (
                    <option key={v} value={v}>
                      {v === 'none' ? 'Sin certificar' : v.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-montserrat text-sm text-gray-600 mb-1">
                  Emisiones
                </label>
                <select
                  value={property.energyRating.emissions}
                  onChange={e =>
                    updateField('energyRating', {
                      ...property.energyRating,
                      emissions: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold"
                >
                  {['none', 'a', 'b', 'c', 'd', 'e', 'f', 'g'].map(v => (
                    <option key={v} value={v}>
                      {v === 'none' ? 'Sin certificar' : v.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ── Description ── */}
          <div className="bg-white p-6 shadow-sm rounded-lg">
            <h2 className="font-montserrat text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
              Descripción
            </h2>
            <textarea
              value={property.description}
              onChange={e => updateField('description', e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold resize-y"
              placeholder="Describe el inmueble en detalle..."
            />
          </div>

          {/* ── Features ── */}
          <div className="bg-white p-6 shadow-sm rounded-lg">
            <h2 className="font-montserrat text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
              Características
            </h2>
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
                className="flex-1 px-3 py-2 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold"
                placeholder="Ej: aire acondicionado"
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

          {/* ── Images ── */}
          <div className="bg-white p-6 shadow-sm rounded-lg">
            <h2 className="font-montserrat text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
              Imágenes ({property.images.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
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
              {property.images.length === 0 && (
                <div className="aspect-[4/3] bg-gray-50 border-2 border-dashed border-gray-200 rounded flex flex-col items-center justify-center col-span-full p-8">
                  <ImageIcon className="w-8 h-8 text-gray-300 mb-2" />
                  <p className="font-montserrat text-sm text-gray-400">
                    Sin imágenes
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
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
                className="flex-1 px-3 py-2 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold"
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
          </div>

          {/* ── Submit ── */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin/dashboard')}
              className="px-6 py-3 font-montserrat text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-brand-gold text-brand-navy font-montserrat text-sm font-semibold hover:bg-brand-gold/90 rounded transition-colors disabled:opacity-70"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isNew ? 'Crear Inmueble' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
