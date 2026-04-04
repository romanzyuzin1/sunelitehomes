import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchAllContacts,
  deleteContact,
} from '../../lib/contactService';
import {
  getContactFullName,
  type Contact,
} from '../../data/contacts';
import {
  Plus,
  Search,
  Trash2,
  Edit,
  Home,
  ShoppingCart,
  Loader2,
  AlertTriangle,
  Phone,
  Mail,
} from 'lucide-react';

type FilterRole = 'all' | 'owner' | 'buyer';

export function ContactList() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<FilterRole>('all');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const loadContacts = useCallback(async () => {
    setLoading(true);
    try {
      setContacts(await fetchAllContacts());
    } catch (err) {
      console.error('Error loading contacts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const filtered = useMemo(() => {
    let list = contacts;

    // Role filter
    if (roleFilter === 'owner') list = list.filter(c => c.isOwner);
    if (roleFilter === 'buyer') list = list.filter(c => c.isBuyer);

    // Text search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        c =>
          c.firstName.toLowerCase().includes(q) ||
          c.lastName.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q),
      );
    }

    return list;
  }, [contacts, search, roleFilter]);

  const handleDelete = async (id: number) => {
    try {
      await deleteContact(id);
      await loadContacts();
    } catch (err) {
      console.error('Error deleting contact:', err);
    }
    setDeleteId(null);
  };

  const statusColors: Record<string, string> = {
    activo: 'bg-green-100 text-green-700',
    inactivo: 'bg-gray-100 text-gray-600',
    cerrado: 'bg-red-100 text-red-700',
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
            Contactos
          </h1>
          <p className="font-montserrat text-sm text-gray-500 mt-1">
            {contacts.length} contacto{contacts.length !== 1 ? 's' : ''}{' '}
            registrado{contacts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          to="/admin/contactos/nuevo"
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-gold text-brand-navy hover:bg-brand-gold/90 transition-colors font-montserrat text-sm font-medium rounded"
        >
          <Plus className="w-4 h-4" />
          Nuevo Contacto
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 mb-4 shadow-sm rounded-lg">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, email, teléfono…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold"
            />
          </div>
          <div className="flex gap-2">
            {(
              [
                { key: 'all', label: 'Todos' },
                { key: 'owner', label: 'Propietarios' },
                { key: 'buyer', label: 'Compradores' },
              ] as const
            ).map(f => (
              <button
                key={f.key}
                onClick={() => setRoleFilter(f.key)}
                className={`px-3 py-2 rounded font-montserrat text-xs font-medium transition-colors ${
                  roleFilter === f.key
                    ? 'bg-brand-gold text-brand-navy'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white p-12 shadow-sm rounded-lg text-center">
          <p className="font-montserrat text-gray-500">
            {search || roleFilter !== 'all'
              ? 'No se encontraron contactos con estos filtros.'
              : 'No hay contactos registrados todavía.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(contact => (
            <div
              key={contact.id}
              className="bg-white p-4 shadow-sm rounded-lg flex flex-col sm:flex-row sm:items-center gap-3"
            >
              {/* Avatar */}
              <div className="w-10 h-10 flex-shrink-0 bg-brand-gold/20 text-brand-gold rounded-full flex items-center justify-center font-montserrat font-semibold text-sm">
                {(contact.firstName || '?').charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    to={`/admin/contactos/${contact.id}/detalle`}
                    className="font-montserrat text-sm font-semibold text-gray-800 hover:text-brand-gold transition-colors"
                  >
                    {getContactFullName(contact)}
                  </Link>
                  {/* Role badges */}
                  {contact.isOwner && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-montserrat bg-amber-100 text-amber-700">
                      <Home className="w-3 h-3" /> Propietario
                    </span>
                  )}
                  {contact.isBuyer && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-montserrat bg-blue-100 text-blue-700">
                      <ShoppingCart className="w-3 h-3" /> Comprador
                    </span>
                  )}
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-montserrat ${statusColors[contact.status] || ''}`}
                  >
                    {contact.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 font-montserrat">
                  {contact.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {contact.email}
                    </span>
                  )}
                  {contact.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {contact.phone}
                    </span>
                  )}
                  {contact.source && (
                    <span className="text-gray-400">
                      Fuente: {contact.source}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 sm:ml-auto">
                <Link
                  to={`/admin/contactos/${contact.id}/detalle`}
                  className="p-2 text-gray-400 hover:text-brand-gold hover:bg-brand-gold/10 rounded transition-colors"
                  title="Ver ficha"
                >
                  <Edit className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => setDeleteId(contact.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete dialog */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="font-montserrat font-semibold text-gray-800">
                Eliminar Contacto
              </h3>
            </div>
            <p className="font-montserrat text-sm text-gray-600 mb-6">
              ¿Seguro que deseas eliminar este contacto? Esta acción no se puede
              deshacer y se desvinculará de todas las propiedades asociadas.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 font-montserrat text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="px-4 py-2 bg-red-500 text-white font-montserrat text-sm font-medium rounded hover:bg-red-600 transition-colors"
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
