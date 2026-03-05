import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchAllProperties, deletePropertyById } from '../../lib/propertyService';
import { formatPrice } from '../../data/properties';
import type { Property } from '../../data/properties';
import {
  Plus,
  Search,
  Trash2,
  Edit,
  ExternalLink,
  AlertTriangle,
  Home,
  Image,
  Loader2,
} from 'lucide-react';

export function AdminDashboard() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const loadProperties = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllProperties();
      setProperties(data);
    } catch (err) {
      console.error('Error loading properties:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProperties(); }, [loadProperties]);

  const filtered = useMemo(() => {
    if (!search.trim()) return properties;
    const q = search.toLowerCase();
    return properties.filter(
      p =>
        p.title.toLowerCase().includes(q) ||
        p.ref.toLowerCase().includes(q) ||
        p.town.toLowerCase().includes(q) ||
        p.province.toLowerCase().includes(q),
    );
  }, [properties, search]);

  const handleDelete = async (id: number) => {
    try {
      await deletePropertyById(id);
      await loadProperties();
    } catch (err) {
      console.error('Error deleting property:', err);
    }
    setDeleteId(null);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-playfair text-2xl text-gray-800 font-semibold">
            Propiedades
          </h1>
          <p className="font-montserrat text-sm text-gray-500 mt-1">
            {properties.length} inmueble{properties.length !== 1 ? 's' : ''}{' '}
            registrado{properties.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/admin/importar"
            className="flex items-center gap-2 px-4 py-2.5 border border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-navy transition-colors font-montserrat text-sm font-medium"
          >
            Importar XML
          </Link>
          <Link
            to="/admin/propiedades/nueva"
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-gold text-brand-navy hover:bg-brand-gold/90 transition-colors font-montserrat text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Nuevo Inmueble
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 mb-4 shadow-sm rounded-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por título, referencia, ciudad..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg font-montserrat text-sm focus:outline-none focus:border-brand-gold transition-colors"
          />
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="bg-white p-12 text-center shadow-sm rounded-lg">
          <Home className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-playfair text-xl text-gray-600 mb-2">
            {properties.length === 0 ? 'No hay propiedades' : 'Sin resultados'}
          </h3>
          <p className="font-montserrat text-sm text-gray-400 mb-6">
            {properties.length === 0
              ? 'Añade tu primer inmueble manualmente o importa desde XML.'
              : 'Prueba con otros términos de búsqueda.'}
          </p>
          {properties.length === 0 && (
            <div className="flex gap-3 justify-center">
              <Link
                to="/admin/propiedades/nueva"
                className="btn-gold text-sm"
              >
                Añadir Inmueble
              </Link>
              <Link to="/admin/importar" className="btn-gold-outline text-sm">
                Importar XML
              </Link>
            </div>
          )}
        </div>
      ) : (
        /* Table */
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 font-montserrat text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Inmueble
                  </th>
                  <th className="text-left px-4 py-3 font-montserrat text-xs font-semibold uppercase tracking-wider text-gray-500 hidden md:table-cell">
                    Ubicación
                  </th>
                  <th className="text-left px-4 py-3 font-montserrat text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Precio
                  </th>
                  <th className="text-left px-4 py-3 font-montserrat text-xs font-semibold uppercase tracking-wider text-gray-500 hidden sm:table-cell">
                    Estado
                  </th>
                  <th className="text-right px-4 py-3 font-montserrat text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(property => (
                  <tr
                    key={property.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          {property.images[0] ? (
                            <img
                              src={property.images[0]}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Image className="w-4 h-4 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-montserrat text-sm font-medium text-gray-800 line-clamp-1">
                            {property.title}
                          </p>
                          <p className="font-montserrat text-xs text-gray-400">
                            Ref: {property.ref} · {property.type}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="font-montserrat text-sm text-gray-600">
                        {property.town}, {property.province}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-montserrat text-sm font-semibold text-brand-navy">
                        {formatPrice(
                          property.price,
                          property.currency,
                          property.priceFreq,
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span
                        className={`inline-flex px-2 py-1 font-montserrat text-xs font-medium rounded-full ${
                          property.status === 'disponible'
                            ? 'bg-green-100 text-green-700'
                            : property.status === 'vendido'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {property.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/inmueble/${property.id}`}
                          target="_blank"
                          className="p-2 text-gray-400 hover:text-brand-gold transition-colors"
                          title="Ver en sitio web"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/admin/propiedades/${property.id}`}
                          className="p-2 text-gray-400 hover:text-brand-navy transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteId(property.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setDeleteId(null)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="font-playfair text-lg font-semibold text-gray-800">
                Eliminar Inmueble
              </h3>
            </div>
            <p className="font-montserrat text-sm text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar este inmueble? Esta acción no
              se puede deshacer.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 font-montserrat text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="px-4 py-2 font-montserrat text-sm text-white bg-red-500 hover:bg-red-600 rounded transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
