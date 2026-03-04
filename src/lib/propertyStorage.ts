import { properties as defaultProperties, type Property } from '../data/properties';

const PROPERTIES_KEY = 'seh_admin_properties';

// ─── CRUD ────────────────────────────────────────────────────────────

export function loadStoredProperties(): Property[] {
  try {
    const raw = localStorage.getItem(PROPERTIES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Property[];
  } catch {
    return [];
  }
}

export function saveStoredProperties(properties: Property[]): void {
  localStorage.setItem(PROPERTIES_KEY, JSON.stringify(properties));
}

export function addProperty(property: Property): void {
  const all = loadStoredProperties();
  all.push(property);
  saveStoredProperties(all);
}

export function updateProperty(id: number, updates: Partial<Property>): void {
  const all = loadStoredProperties();
  const index = all.findIndex(p => p.id === id);
  if (index !== -1) {
    all[index] = { ...all[index], ...updates };
    saveStoredProperties(all);
  }
}

export function deleteProperty(id: number): void {
  const all = loadStoredProperties().filter(p => p.id !== id);
  saveStoredProperties(all);
}

export function getNextId(): number {
  const all = loadStoredProperties();
  const defaultMax = Math.max(...defaultProperties.map(p => p.id), 0);
  if (all.length === 0) return Math.max(defaultMax + 1, 100);
  return Math.max(...all.map(p => p.id), defaultMax) + 1;
}

export function createEmptyProperty(): Property {
  return {
    id: getNextId(),
    date: new Date().toISOString().split('T')[0],
    title: '',
    ref: '',
    price: 0,
    currency: 'EUR',
    priceFreq: 'sale',
    type: 'Casa',
    buildYear: null,
    town: '',
    postcode: '',
    province: '',
    location: { latitude: null, longitude: null, address: '' },
    beds: 0,
    baths: 0,
    pool: false,
    surfaceArea: { built: 0, plot: 0 },
    energyRating: { consumption: 'none', emissions: 'none' },
    description: '',
    features: [],
    status: 'disponible',
    images: [],
  };
}

// ─── Composite Reads ─────────────────────────────────────────────────

/** Returns stored properties if any, otherwise the hardcoded defaults. */
export function getAllProperties(): Property[] {
  const stored = loadStoredProperties();
  return stored.length > 0 ? stored : defaultProperties;
}

/** Search both stored and default properties by id. */
export function getPropertyByIdFromAll(id: number): Property | undefined {
  const stored = loadStoredProperties();
  const fromStored = stored.find(p => p.id === id);
  if (fromStored) return fromStored;
  return defaultProperties.find(p => p.id === id);
}

// ─── XML Parsing ─────────────────────────────────────────────────────

function getTagContent(el: Element, ...tagNames: string[]): string {
  for (const tag of tagNames) {
    const node = el.querySelector(tag) ?? el.getElementsByTagName(tag)[0];
    if (node?.textContent) return node.textContent.trim();
  }
  return '';
}

function getAllTagContents(el: Element, ...tagNames: string[]): string[] {
  const results: string[] = [];
  for (const tag of tagNames) {
    const nodes = el.getElementsByTagName(tag);
    for (let i = 0; i < nodes.length; i++) {
      const text = nodes[i].textContent?.trim();
      if (text) results.push(text);
    }
    if (results.length > 0) return results;
  }
  return results;
}

function findPropertyElements(doc: Document): Element[] {
  const propertyTags = [
    'inmueble', 'propiedad', 'property', 'listing',
    'Inmueble', 'Propiedad', 'Property', 'Listing',
    'vivienda', 'finca', 'piso', 'casa',
  ];

  for (const tag of propertyTags) {
    const elements = doc.getElementsByTagName(tag);
    if (elements.length > 0) return Array.from(elements);
  }

  // Fallback: direct children of root with enough sub-elements
  const children = Array.from(doc.documentElement.children).filter(
    el => el.children.length > 2,
  );
  if (children.length > 0) return children;

  return [];
}

export function parseInmoCmsXml(xmlString: string): Property[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'text/xml');

  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error('Error al parsear el XML: ' + parseError.textContent);
  }

  const propertyElements = findPropertyElements(doc);

  if (propertyElements.length === 0) {
    throw new Error(
      'No se encontraron inmuebles en el XML. Asegúrese de que el formato sea correcto.',
    );
  }

  const baseId = getNextId();

  return propertyElements.map((el, index) => {
    const id =
      parseInt(getTagContent(el, 'id', 'ID', 'Id')) || baseId + index;
    const price =
      parseFloat(
        getTagContent(
          el,
          'precio', 'price', 'Precio', 'Price',
          'precio_venta', 'sale_price',
        ),
      ) || 0;
    const lat = parseFloat(
      getTagContent(el, 'latitud', 'latitude', 'Latitud', 'lat', 'Lat'),
    );
    const lng = parseFloat(
      getTagContent(
        el,
        'longitud', 'longitude', 'Longitud', 'lng', 'Lng', 'lon',
      ),
    );
    const built =
      parseFloat(
        getTagContent(
          el,
          'superficie_construida', 'built_area', 'superficie',
          'area_construida', 'built', 'm2_construidos',
        ),
      ) || 0;
    const plot =
      parseFloat(
        getTagContent(
          el,
          'superficie_parcela', 'plot_area', 'parcela',
          'area_parcela', 'plot', 'm2_parcela',
        ),
      ) || 0;
    const buildYear =
      parseInt(
        getTagContent(
          el,
          'ano_construccion', 'year_built', 'ano', 'build_year', 'antiguedad',
        ),
      ) || null;

    const imageUrls = getAllTagContents(
      el,
      'url', 'imagen', 'image', 'foto', 'photo', 'url_imagen', 'image_url',
    );
    const images = imageUrls.length > 0 ? imageUrls : getAllTagContents(el, 'img');

    const features = getAllTagContents(
      el,
      'caracteristica', 'feature', 'equipamiento', 'extra',
    );

    const freqRaw = getTagContent(
      el,
      'frecuencia_precio', 'price_freq', 'frecuencia',
      'operacion', 'operation', 'tipo_operacion',
    );
    const priceFreq: 'sale' | 'month' = ['rent', 'alquiler', 'month', 'mes'].some(
      k => freqRaw.toLowerCase().includes(k),
    )
      ? 'month'
      : 'sale';

    return {
      id,
      date:
        getTagContent(el, 'fecha', 'date', 'Date', 'fecha_alta', 'created') ||
        new Date().toISOString().split('T')[0],
      title:
        getTagContent(
          el,
          'titulo', 'title', 'nombre', 'name', 'Titulo', 'Title',
        ) || `Inmueble ${id}`,
      ref:
        getTagContent(
          el,
          'referencia', 'ref', 'reference', 'Referencia', 'Ref', 'codigo',
        ) || String(id),
      price,
      currency:
        getTagContent(el, 'moneda', 'currency', 'divisa') || 'EUR',
      priceFreq,
      type:
        getTagContent(
          el,
          'tipo', 'type', 'tipo_inmueble', 'property_type', 'subtipo',
        ) || 'Casa',
      buildYear,
      town:
        getTagContent(
          el,
          'poblacion', 'town', 'ciudad', 'city', 'localidad', 'municipio',
        ) || '',
      postcode:
        getTagContent(el, 'codigo_postal', 'postcode', 'cp', 'zip', 'postal_code') || '',
      province:
        getTagContent(el, 'provincia', 'province', 'state', 'comunidad', 'region') || '',
      location: {
        latitude: isNaN(lat) ? null : lat,
        longitude: isNaN(lng) ? null : lng,
        address:
          getTagContent(el, 'direccion', 'address', 'calle', 'street', 'ubicacion') || '',
      },
      beds:
        parseInt(
          getTagContent(el, 'dormitorios', 'bedrooms', 'beds', 'habitaciones', 'rooms'),
        ) || 0,
      baths:
        parseInt(
          getTagContent(el, 'banos', 'bathrooms', 'baths', 'aseos'),
        ) || 0,
      pool: ['si', 'sí', 'yes', 'true', '1'].includes(
        getTagContent(el, 'piscina', 'pool', 'swimming_pool').toLowerCase(),
      ),
      surfaceArea: { built, plot },
      energyRating: {
        consumption:
          getTagContent(
            el,
            'consumo_energetico', 'energy_consumption', 'consumo',
            'calificacion_energetica', 'energy_rating',
          ) || 'none',
        emissions:
          getTagContent(el, 'emisiones', 'emissions', 'emisiones_co2') || 'none',
      },
      description:
        getTagContent(
          el,
          'descripcion', 'description', 'texto', 'text', 'Descripcion', 'Description',
        ) || '',
      features,
      status:
        getTagContent(el, 'estado', 'status', 'situacion') || 'disponible',
      images,
    };
  });
}
