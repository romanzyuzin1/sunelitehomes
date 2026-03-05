import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseInmoCmsXml } from '../../lib/propertyStorage';
import { bulkInsertProperties } from '../../lib/propertyService';
import type { Property } from '../../data/properties';
import {
  Upload,
  FileText,
  Check,
  AlertTriangle,
  X,
  Download,
} from 'lucide-react';

export function XmlImportPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedProperties, setParsedProperties] = useState<Property[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setParsedProperties([]);
    setImported(false);
    setFileName(file.name);

    try {
      const text = await file.text();
      const properties = parseInmoCmsXml(text);
      setParsedProperties(properties);
      setSelected(new Set(properties.map(p => p.id)));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al procesar el archivo XML',
      );
    }
  };

  const toggleSelect = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === parsedProperties.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(parsedProperties.map(p => p.id)));
    }
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const toImport = parsedProperties.filter(p => selected.has(p.id));
      await bulkInsertProperties(toImport);
      setImported(true);
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 2000);
    } catch {
      setError('Error al guardar los inmuebles. Inténtelo de nuevo.');
    } finally {
      setImporting(false);
    }
  };

  const generateSampleXml = () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<inmuebles>
  <inmueble>
    <id>101</id>
    <referencia>REF-001</referencia>
    <titulo>Apartamento Ejemplo en Barcelona</titulo>
    <precio>450000</precio>
    <moneda>EUR</moneda>
    <tipo_operacion>venta</tipo_operacion>
    <tipo>Piso</tipo>
    <ano_construccion>2010</ano_construccion>
    <poblacion>Barcelona</poblacion>
    <codigo_postal>08001</codigo_postal>
    <provincia>Barcelona</provincia>
    <direccion>Calle Ejemplo, 123</direccion>
    <latitud>41.3874</latitud>
    <longitud>2.1686</longitud>
    <dormitorios>3</dormitorios>
    <banos>2</banos>
    <piscina>si</piscina>
    <superficie_construida>120</superficie_construida>
    <superficie_parcela>0</superficie_parcela>
    <consumo_energetico>c</consumo_energetico>
    <emisiones>d</emisiones>
    <descripcion>Un hermoso apartamento de ejemplo para demostrar la importación XML.</descripcion>
    <caracteristicas>
      <caracteristica>aire acondicionado</caracteristica>
      <caracteristica>ascensor</caracteristica>
      <caracteristica>terraza</caracteristica>
    </caracteristicas>
    <estado>disponible</estado>
    <imagenes>
      <imagen>
        <url>https://example.com/imagen1.jpg</url>
      </imagen>
      <imagen>
        <url>https://example.com/imagen2.jpg</url>
      </imagen>
    </imagenes>
  </inmueble>
</inmuebles>`;

    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ejemplo_inmuebles.xml';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-playfair text-2xl text-gray-800 font-semibold">
          Importar XML
        </h1>
        <p className="font-montserrat text-sm text-gray-500 mt-1">
          Importa inmuebles desde un archivo XML exportado de InmoCMS u otro
          CRM inmobiliario.
        </p>
      </div>

      {/* ── Upload area ── */}
      {!imported && parsedProperties.length === 0 && (
        <div className="bg-white p-8 shadow-sm rounded-lg">
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-brand-gold hover:bg-brand-gold/5 transition-all"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-montserrat text-lg text-gray-700 mb-2">
              Selecciona un archivo XML
            </h3>
            <p className="font-montserrat text-sm text-gray-400 mb-4">
              Arrastra aquí o haz clic para seleccionar
            </p>
            <p className="font-montserrat text-xs text-gray-400">
              Formatos soportados: XML de InmoCMS, Idealista, Fotocasa y
              otros portales inmobiliarios
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xml,text/xml,application/xml"
            onChange={handleFileSelect}
            className="hidden"
          />

          {error && (
            <div className="mt-4 flex items-start gap-3 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-montserrat text-sm font-medium">
                  Error al procesar el archivo
                </p>
                <p className="font-montserrat text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="font-montserrat text-sm text-gray-500 mb-3">
              ¿No tienes un archivo XML?
            </p>
            <button
              onClick={generateSampleXml}
              className="flex items-center gap-2 text-brand-gold hover:text-brand-navy font-montserrat text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Descargar XML de ejemplo
            </button>
          </div>
        </div>
      )}

      {/* ── Parsed Results ── */}
      {parsedProperties.length > 0 && !imported && (
        <div className="space-y-4">
          {/* File info bar */}
          <div className="bg-white p-4 shadow-sm rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-brand-gold" />
              <div>
                <p className="font-montserrat text-sm font-medium text-gray-800">
                  {fileName}
                </p>
                <p className="font-montserrat text-xs text-gray-400">
                  {parsedProperties.length} inmueble
                  {parsedProperties.length !== 1 ? 's' : ''} encontrado
                  {parsedProperties.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setParsedProperties([]);
                setSelected(new Set());
                setFileName('');
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Selection list */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.size === parsedProperties.length}
                  onChange={toggleAll}
                  className="w-4 h-4 text-brand-gold border-gray-300 rounded focus:ring-brand-gold accent-[#C9A96E]"
                />
                <span className="font-montserrat text-sm text-gray-600">
                  Seleccionar todos ({selected.size} de{' '}
                  {parsedProperties.length})
                </span>
              </label>
            </div>

            <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
              {parsedProperties.map(property => (
                <label
                  key={property.id}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(property.id)}
                    onChange={() => toggleSelect(property.id)}
                    className="w-4 h-4 text-brand-gold border-gray-300 rounded focus:ring-brand-gold accent-[#C9A96E]"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-montserrat text-sm font-medium text-gray-800 truncate">
                      {property.title}
                    </p>
                    <p className="font-montserrat text-xs text-gray-400">
                      Ref: {property.ref} · {property.type} ·{' '}
                      {property.town}, {property.province}
                      {property.images.length > 0 &&
                        ` · ${property.images.length} imgs`}
                    </p>
                  </div>
                  <span className="font-montserrat text-sm font-semibold text-brand-navy whitespace-nowrap">
                    {property.price > 0
                      ? new Intl.NumberFormat('es-ES', {
                          style: 'currency',
                          currency: property.currency,
                          maximumFractionDigits: 0,
                        }).format(property.price)
                      : '—'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setParsedProperties([]);
                setSelected(new Set());
              }}
              className="px-4 py-2.5 font-montserrat text-sm text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleImport}
              disabled={selected.size === 0 || importing}
              className="flex items-center gap-2 px-6 py-2.5 bg-brand-gold text-brand-navy font-montserrat text-sm font-semibold rounded hover:bg-brand-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              Importar {selected.size} inmueble
              {selected.size !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      )}

      {/* ── Success ── */}
      {imported && (
        <div className="bg-white p-12 shadow-sm rounded-lg text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="font-playfair text-xl text-gray-800 mb-2">
            Importación Completada
          </h3>
          <p className="font-montserrat text-sm text-gray-500">
            Se han importado {selected.size} inmueble
            {selected.size !== 1 ? 's' : ''} correctamente. Redirigiendo…
          </p>
        </div>
      )}
    </div>
  );
}
