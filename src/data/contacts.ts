/** Contact types for SunEliteHomes CRM */

export interface Contact {
  id: number;
  createdAt: string;
  updatedAt: string;

  // Personal
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  phone2: string;

  // Roles
  isOwner: boolean;   // wants to sell or rent out
  isBuyer: boolean;   // wants to buy or rent

  // Owner: what do they want?
  ownerIntent: 'sell' | 'rent' | 'both';

  // Buyer: what are they looking for?
  interestType: 'buy' | 'rent' | 'both';
  budgetMin: number | null;
  budgetMax: number | null;
  prefBeds: number | null;
  prefBaths: number | null;
  prefZones: string[];
  prefTypes: string[];

  // General
  notes: string;
  source: string;
  status: 'activo' | 'inactivo' | 'cerrado';
}

export interface PropertyInterest {
  id: number;
  propertyId: number;
  contactId: number;
  createdAt: string;
  interestLevel: 'low' | 'medium' | 'high';
  notes: string;
}

export function getContactFullName(c: Contact): string {
  return `${c.firstName} ${c.lastName}`.trim() || '(Sin nombre)';
}

export function createEmptyContact(): Contact {
  return {
    id: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    phone2: '',
    isOwner: false,
    isBuyer: true,
    ownerIntent: 'sell',
    interestType: 'buy',
    budgetMin: null,
    budgetMax: null,
    prefBeds: null,
    prefBaths: null,
    prefZones: [],
    prefTypes: [],
    notes: '',
    source: '',
    status: 'activo',
  };
}
