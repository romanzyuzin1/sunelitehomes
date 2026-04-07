export interface Property {
  id: number;
  date: string;
  title: string;
  ref: string;
  price: number;
  currency: string;
  priceFreq: 'sale' | 'month';
  type: string;
  buildYear: number | null;
  town: string;
  postcode: string;
  province: string;
  location: {
    latitude: number | null;
    longitude: number | null;
    address: string;
  };
  beds: number;
  baths: number;
  pool: boolean;
  surfaceArea: {
    built: number;
    plot: number;
    usable: number;
    habitable: number;
  };
  energyRating: {
    consumption: string;
    emissions: string;
  };
  description: string;
  descriptionZone: string;
  privateNotes: string;
  isPublic: boolean;
  features: string[];
  status: string;
  images: string[];

  // Extended fields (Engel & Völkers style)
  rooms?: number;
  ensuiteBaths?: number;
  hasPatio?: boolean;
  hasStudio?: boolean;
  hasServiceRoom?: boolean;
  parkingSpaces?: number;
  orientation?: string;
  floor?: string;
  hasLift?: boolean;
  heatingType?: string;
  furnished?: string;
}

export const properties: Property[] = [
  {
    id: 1,
    date: '2023-10-27',
    title: 'Hermoso Apartamento en el Centro de Madrid',
    ref: '00077',
    price: 695000,
    currency: 'EUR',
    priceFreq: 'sale',
    type: 'Casa',
    buildYear: 1983,
    town: 'Majadahonda',
    postcode: '28030',
    province: 'Madrid',
    location: {
      latitude: 40.410908763692944,
      longitude: -3.6564329914782396,
      address: 'Camino Vinateros, 13',
    },
    beds: 2,
    baths: 2,
    pool: false,
    surfaceArea: { built: 102, plot: 89, usable: 0, habitable: 0 },
    energyRating: { consumption: 'none', emissions: 'none' },
    description:
      'Este hermoso apartamento de 2 dormitorios está ubicado en el corazón de Madrid, en una de las zonas más emblemáticas de la ciudad. Su ubicación estratégica ofrece una experiencia de vida única, con todos los servicios y comodidades al alcance de tu mano.\n\nAl ingresar a la propiedad, te sorprenderá su diseño interior elegante y funcional. El amplio salón comedor es el lugar perfecto para relajarte y disfrutar de momentos especiales con familia y amigos. Grandes ventanas permiten que la luz natural llene el espacio, creando un ambiente cálido y acogedor. Desde la sala de estar, se accede a un balcón privado con vistas a las bulliciosas calles de Madrid, ideal para disfrutar de una taza de café por la mañana o una copa de vino al atardecer.\n\nLa cocina está totalmente equipada con electrodomésticos modernos y ofrece un espacio cómodo para preparar tus comidas favoritas. Los dos dormitorios son luminosos y espaciosos, con armarios empotrados que proporcionan suficiente espacio de almacenamiento. El baño principal es elegante y funcional, con una bañera y acabados de alta calidad.\n\nEste apartamento se encuentra en un edificio bien mantenido con ascensor y una plaza de garaje privada. La propiedad también ofrece una cuota de comunidad mensual que cubre los servicios comunes y el mantenimiento del edificio.\n\nLa ubicación en el centro de Madrid es insuperable. Estás a pocos pasos de los principales puntos de interés de la ciudad, como el Parque del Retiro, el Museo del Prado, el Palacio Real y la Puerta del Sol. Además, la zona está repleta de restaurantes, tiendas, teatros y vida nocturna, lo que te permite disfrutar de la rica cultura y entretenimiento que Madrid tiene para ofrecer.\n\nNo pierdas la oportunidad de adquirir este encantador apartamento en el corazón de Madrid. Es la elección perfecta para aquellos que desean vivir la vida urbana con estilo y comodidad.',
    features: [
      'trastero', 'aire acondicionado', 'ascensor', 'despensa', 'domótica',
      'parabólica', 'pista de fútbol', 'txoko', 'video portero', 'garaje doble',
      'linea teléfono', 'piscina de comunidad', 'sotano', 'buhardilla', 'vallado',
    ],
    descriptionZone: '',
    privateNotes: '',
    isPublic: true,
    status: 'disponible',
    images: [
      'https://nunibU4IP5.inmocms.com/store/inmuebles/653b03716a69e_Pagina_web_inmobiliaria_0.jpeg',
      'https://nunibU4IP5.inmocms.com/store/inmuebles/653b03716aba2_Pagina_web_inmobiliaria_4.jpeg',
      'https://nunibU4IP5.inmocms.com/store/inmuebles/653b03716b078_Pagina_web_inmobiliaria_11.jpeg',
      'https://nunibU4IP5.inmocms.com/store/inmuebles/653b03716b5c3_Pagina_web_inmobiliaria_12.jpeg',
      'https://nunibU4IP5.inmocms.com/store/inmuebles/653b03716b9fa_Pagina_web_inmobiliaria_8.jpeg',
      'https://nunibU4IP5.inmocms.com/store/inmuebles/653b03716bd7e_Pagina_web_inmobiliaria_2.jpeg',
      'https://nunibU4IP5.inmocms.com/store/inmuebles/653b03716c0e8_Pagina_web_inmobiliaria_3.jpeg',
      'https://nunibU4IP5.inmocms.com/store/inmuebles/653b03716c427_Pagina_web_inmobiliaria_5.jpeg',
      'https://nunibU4IP5.inmocms.com/store/inmuebles/653b03716c704_Pagina_web_inmobiliaria_7.jpeg',
      'https://nunibU4IP5.inmocms.com/store/inmuebles/653b03716ca7f_Pagina_web_inmobiliaria_9.jpeg',
      'https://nunibU4IP5.inmocms.com/store/inmuebles/653b03716cf67_Pagina_web_inmobiliaria_6.jpeg',
      'https://nunibU4IP5.inmocms.com/store/inmuebles/653b03716d2f4_Pagina_web_inmobiliaria_1.jpeg',
      'https://nunibU4IP5.inmocms.com/store/inmuebles/653b03716d7c3_Pagina_web_inmobiliaria_10.jpeg',
      'https://nunibU4IP5.inmocms.com/store/inmuebles/653b03716daeb_Pagina_web_inmobiliaria_13.jpeg',
    ],
  },
  {
    id: 2,
    date: '2023-10-27',
    title: 'Precioso Ático en Móstoles',
    ref: '78',
    price: 595000,
    currency: 'EUR',
    priceFreq: 'sale',
    type: 'Ático',
    buildYear: 1973,
    town: 'Móstoles',
    postcode: '28931',
    province: 'Madrid',
    location: {
      latitude: 40.32860923224531,
      longitude: -3.863826436197057,
      address: 'Estación, 13',
    },
    beds: 2,
    baths: 2,
    pool: false,
    surfaceArea: { built: 125, plot: 107, usable: 0, habitable: 0 },
    energyRating: { consumption: 'b', emissions: 'c' },
    description:
      'Este impresionante ático se encuentra en una de las ubicaciones más codiciadas de Madrid, en la prestigiosa Avenida América. Con una vista panorámica de la ciudad, este ático ofrece un oasis de lujo y tranquilidad en medio del bullicio de la ciudad.\n\nCaracterísticas destacadas:\n\nAmplia terraza con vistas espectaculares: El punto culminante de esta propiedad es su gran terraza privada, desde la cual podrás disfrutar de vistas panorámicas de Madrid, incluyendo emblemáticos lugares como la Plaza de Cibeles y el Parque de El Retiro. Es el lugar perfecto para relajarse o entretener a amigos y familiares.\n\nDiseño elegante y moderno: El interior del ático ha sido diseñado con un estilo contemporáneo y elegante. Los espacios están llenos de luz natural gracias a las amplias ventanas que permiten disfrutar de las vistas desde el interior. Los acabados de alta calidad y los detalles de diseño hacen de este ático un lugar verdaderamente exclusivo.\n\nEspacios amplios y funcionales: Con una distribución inteligente, este ático cuenta con una amplia sala de estar, una cocina totalmente equipada con electrodomésticos de última generación y tres dormitorios espaciosos, cada uno con su propio baño privado.\n\nZona bien comunicada: La ubicación en Avenida América te ofrece una excelente conectividad con el transporte público, lo que facilita el acceso a cualquier parte de la ciudad. Además, está rodeado de restaurantes, tiendas de lujo y todo tipo de servicios.\n\nAparcamiento y trastero: El ático incluye dos plazas de aparcamiento y un trastero, lo que hace que la vida en el centro de la ciudad sea aún más cómoda.\n\nEste "Precioso ático en Avenida América" es la elección perfecta para quienes buscan un estilo de vida lujoso y sofisticado en el corazón de Madrid.',
    features: [
      'entidad bancaria', 'aire acondicionado', 'caja fuerte', 'calefacción',
      'calefacción central', 'calefacción gasoil', 'interior', 'deposito de agua',
      'diafano', 'garaje doble', 'lavanderia',
    ],
    descriptionZone: '',
    privateNotes: '',
    isPublic: true,
    status: 'disponible',
    images: [
      'https://nunibU4IP5.inmocms.com/store/inmuebles/653b0e528091a_CRM_inmobiliario_1.jpg',
      'https://nunibU4IP5.inmocms.com/store/inmuebles/653b0e78b1d7e_CRM_inmobiliario_2.jpg',
      'https://nunibU4IP5.inmocms.com/store/inmuebles/653b0e78b2398_CRM_inmobiliario_3.jpg',
      'https://nunibU4IP5.inmocms.com/store/inmuebles/653b0e78b29d2_CRM_inmobiliario_4-1.jpg',
    ],
  },
  {
    id: 3,
    date: '2023-10-27',
    title: 'Piso en Getafe Recién Reformado',
    ref: '79',
    price: 260000,
    currency: 'EUR',
    priceFreq: 'sale',
    type: 'Piso',
    buildYear: null,
    town: 'Getafe',
    postcode: '28906',
    province: 'Madrid',
    location: {
      latitude: 40.31806646383627,
      longitude: -3.697038888931275,
      address: 'Avenida Caballero de la Triste Figura',
    },
    beds: 3,
    baths: 2,
    pool: true,
    surfaceArea: { built: 92, plot: 89, usable: 0, habitable: 0 },
    energyRating: { consumption: 'none', emissions: 'none' },
    description:
      '¿Buscas comprar un piso amplio y bien equipado en Getafe? ¡No busques más! Tenemos la propiedad perfecta para ti. Este encantador piso, situado en Getafe, ya está a la venta. Con sus tres dormitorios, dos baños, cocina y salón, esta propiedad te ofrece todo lo que necesitas para vivir cómodamente.\n\nEl piso tiene una superficie de 89,00 metros cuadrados, lo que proporciona un amplio espacio para que tú y tu familia os relajéis y disfrutéis. El salón es luminoso y ventilado, y ofrece un espacio acogedor para relajarse después de un largo día. La cocina es moderna y está totalmente equipada, por lo que será un placer preparar deliciosas comidas para tus seres queridos.\n\nUna de las características más destacadas de este apartamento es la terraza, donde podrás tomar el sol y disfrutar del aire fresco. Es el lugar perfecto para tomar el café de la mañana o celebrar una pequeña reunión con amigos y familiares. Además, el apartamento dispone de garaje, para que tengas un lugar cómodo y seguro donde aparcar tu vehículo.\n\nSituado en Getafe, este apartamento ofrece fácil acceso a diversos servicios e instalaciones. Encontrarás colegios, supermercados, parques y restaurantes muy cerca, lo que lo convierte en un lugar cómodo y deseable para vivir.\n\nNo dejes pasar esta increíble oportunidad de poseer un fantástico piso en Getafe. Tanto si vas a comprar por primera vez como si quieres mejorar tu vivienda actual, esta propiedad cumple todos los requisitos. Asegúrate de concertar una visita y comprueba por ti mismo el potencial de este piso. ¡Actúa rápido antes de que sea demasiado tarde!',
    features: [
      'hilo musical', 'piscina', 'pista de pádel', 'txoko', 'lavanderia',
      'sotano', 'montaña', 'parada autobus', 'tranvia', 'hospitales',
    ],
    descriptionZone: '',
    privateNotes: '',
    isPublic: true,
    status: 'disponible',
    images: [
      'https://nunibU4IP5.inmocms.com/store/inmuebles/653b15e40a975_WEB_ INMOBILIARIA_CRM_1.jpeg',
      'https://nunibU4IP5.inmocms.com/store/inmuebles/653b15e40b019_WEB_ INMOBILIARIA_CRM_2.jpeg',
      'https://nunibU4IP5.inmocms.com/store/inmuebles/653b15e40b2d9_WEB_ INMOBILIARIA_CRM_3.jpeg',
      'https://nunibU4IP5.inmocms.com/store/inmuebles/653b15e40b56e_WEB_ INMOBILIARIA_CRM_4.jpeg',
      'https://nunibU4IP5.inmocms.com/store/inmuebles/653b15e40b8a6_WEB_ INMOBILIARIA_CRM_5.jpeg',
      'https://nunibU4IP5.inmocms.com/store/inmuebles/653b15e40bbb9_WEB_ INMOBILIARIA_CRM_6.jpeg',
      'https://nunibU4IP5.inmocms.com/store/inmuebles/653b15e40be1e_WEB_ INMOBILIARIA_CRM_7.jpeg',
    ],
  },
  {
    id: 4,
    date: '2023-11-04',
    title: 'Apartamento Reformado en Bakio',
    ref: 'B80',
    price: 950,
    currency: 'EUR',
    priceFreq: 'month',
    type: 'Piso',
    buildYear: 1980,
    town: 'Bakio',
    postcode: '48620',
    province: 'Vizcaya',
    location: {
      latitude: 43.42960365311589,
      longitude: -2.806001816279604,
      address: 'Erdikobenta Kalea',
    },
    beds: 2,
    baths: 1,
    pool: true,
    surfaceArea: { built: 95, plot: 87, usable: 0, habitable: 0 },
    energyRating: { consumption: 'b', emissions: 'b' },
    description:
      'Bienvenido a tu retiro costero perfecto en Bakio. Este impresionante apartamento completamente reformado te ofrece una oportunidad única de disfrutar de la vida en una de las localidades más hermosas de la costa vasca. Con una ubicación privilegiada a pocos pasos de la playa y vistas panorámicas al mar, este apartamento de dos habitaciones te brinda una combinación de comodidad y estilo inigualable.\n\nDiseño Moderno y Luminoso: La reforma de este apartamento ha creado un espacio abierto y lleno de luz que te hará sentir en casa desde el primer momento. Los tonos neutros y los acabados de alta calidad aportan elegancia a cada rincón.\n\nCocina Totalmente Equipada: La cocina de diseño es un sueño hecho realidad para los amantes de la gastronomía, con electrodomésticos de acero inoxidable y encimeras de granito. Es el lugar perfecto para preparar deliciosas comidas y disfrutarlas en el comedor contiguo.\n\nVistas al Mar: Desde el balcón privado, podrás deleitarte con las impresionantes vistas al mar y escuchar las olas romper en la playa. Es un lugar ideal para relajarte con una copa de vino al atardecer.\n\nHabitaciones Amplias: Las dos habitaciones ofrecen espacio más que suficiente para el descanso y el almacenamiento. La habitación principal cuenta con un baño en suite.\n\nUbicación Perfecta: Este apartamento se encuentra en el centro de Bakio, a pocos pasos de la playa, tiendas, restaurantes y todas las comodidades que esta encantadora localidad costera tiene para ofrecer.',
    features: [
      'obra nueva', 'trastero', 'acceso movilidad reducida', 'aire acondicionado',
      'ascensor', 'calefacción', 'energía solar', 'piscina', 'soleado',
      'urbanización', 'vistas', 'armario empotrado', 'garaje doble',
      'primera linea', 'mirador', 'montaña',
    ],
    descriptionZone: '',
    privateNotes: '',
    isPublic: true,
    status: 'disponible',
    images: [
      'https://nunibU4IP5.inmocms.com/store/inmuebles/65457e0b2f831_CREAR-WEB-INMOBILIARIA-2.jpg',
      'https://nunibU4IP5.inmocms.com/store/inmuebles/654580694bcca_CREAR-WEB-INMOBILIARIA-1.jpg',
      'https://nunibU4IP5.inmocms.com/store/inmuebles/654580694cd47_CREAR-WEB-INMOBILIARIA-3.jpg',
      'https://nunibU4IP5.inmocms.com/store/inmuebles/654580694d17d_CREAR-WEB-INMOBILIARIA-4.jpg',
      'https://nunibU4IP5.inmocms.com/store/inmuebles/654580694d4f7_CREAR-WEB-INMOBILIARIA-5.jpg',
      'https://nunibU4IP5.inmocms.com/store/inmuebles/654580694d7f6_CREAR-WEB-INMOBILIARIA-6.jpg',
      'https://nunibU4IP5.inmocms.com/store/inmuebles/654580694dbc8_CREAR-WEB-INMOBILIARIA-7.jpg',
      'https://nunibU4IP5.inmocms.com/store/inmuebles/654580694df52_CREAR-WEB-INMOBILIARIA-8.jpg',
      'https://nunibU4IP5.inmocms.com/store/inmuebles/654580694e2c6_CREAR-WEB-INMOBILIARIA-9.jpg',
    ],
  },
  {
    id: 5,
    date: '2023-08-09',
    title: 'Piso en Estepona con Vistas',
    ref: 'E010',
    price: 315000,
    currency: 'EUR',
    priceFreq: 'sale',
    type: 'Piso',
    buildYear: 2005,
    town: 'Estepona',
    postcode: '29680',
    province: 'Málaga',
    location: {
      latitude: 36.418473509853825,
      longitude: -5.174903869628907,
      address: 'Calle Juan de Fuca',
    },
    beds: 2,
    baths: 1,
    pool: true,
    surfaceArea: { built: 82, plot: 75, usable: 0, habitable: 0 },
    energyRating: { consumption: 'a', emissions: 'a' },
    description:
      'Este excepcional piso de tres habitaciones en Estepona te ofrece una experiencia única de vida junto al mar. Desde su amplio balcón, disfrutarás de vistas inigualables del Mar Mediterráneo, proporcionando una sensación de paz y lujo en cada rincón. El diseño contemporáneo y los acabados de alta calidad se combinan para crear un ambiente luminoso y elegante. La cocina de chef, las habitaciones espaciosas y las comodidades de lujo hacen de este piso una joya en la codiciada Costa del Sol. Ubicado a pocos minutos del centro de Estepona, con tiendas, restaurantes y playas a tu alcance, esta propiedad es ideal para aquellos que buscan la vida costera de ensueño.\n\n¡Contáctanos ahora para descubrir este paraíso frente al mar en persona!',
    features: [
      'trastero', 'aire acondicionado', 'alarma', 'ascensor', 'c/i gas',
      'calefacción', 'despensa', 'domótica', 'energía solar', 'exterior',
      'piscina', 'video portero', 'vistas', 'primera linea', 'mirador',
      'vistas al mar', 'costa', 'colegios',
    ],
    descriptionZone: '',
    privateNotes: '',
    isPublic: true,
    status: 'disponible',
    images: [
      'https://nunibU4IP5.inmocms.com/store/inmuebles/654582bdb2c7d_pagina-web-inmobiliaria-10.jpg',
      'https://nunibU4IP5.inmocms.com/store/inmuebles/654582de2ea5a_pagina-web-inmobiliaria-3.jpg',
      'https://nunibU4IP5.inmocms.com/store/inmuebles/654582de2ef5d_pagina-web-inmobiliaria-4.jpg',
      'https://nunibU4IP5.inmocms.com/store/inmuebles/654582de2f30e_pagina-web-inmobiliaria-5.jpg',
      'https://nunibU4IP5.inmocms.com/store/inmuebles/654582de2f6ab_pagina-web-inmobiliaria-6.jpg',
      'https://nunibU4IP5.inmocms.com/store/inmuebles/654582de2fa35_pagina-web-inmobiliaria-8.jpg',
      'https://nunibU4IP5.inmocms.com/store/inmuebles/654582de2ff8c_pagina-web-inmobiliaria-10.jpg',
      'https://nunibU4IP5.inmocms.com/store/inmuebles/654582de304a6_pagina-web-inmobiliaria-12.jpg',
      'https://nunibU4IP5.inmocms.com/store/inmuebles/654582de3082b_pagina-web-inmobiliaria-13.jpg',
      'https://nunibU4IP5.inmocms.com/store/inmuebles/654582de30c11_pagina-web-inmobiliaria-15.jpg',
      'https://nunibU4IP5.inmocms.com/store/inmuebles/654582de30fc4_pagina-web-inmobiliaria-16.jpg',
    ],
  },
  {
    id: 6,
    date: '2023-07-21',
    title: 'Piso de Alquiler a Estrenar en Santander',
    ref: 'E11',
    price: 1000,
    currency: 'EUR',
    priceFreq: 'month',
    type: 'Piso',
    buildYear: 2010,
    town: 'Santander',
    postcode: '39008',
    province: 'Cantabria',
    location: {
      latitude: 43.46158844999911,
      longitude: -3.8116121292114262,
      address: 'Pasaje de Peña',
    },
    beds: 3,
    baths: 1,
    pool: false,
    surfaceArea: { built: 100, plot: 95, usable: 0, habitable: 0 },
    energyRating: { consumption: 'a', emissions: 'a' },
    description:
      'Este luminoso y moderno piso de obra nueva es una oportunidad excepcional para aquellos que buscan una residencia contemporánea en el corazón de Santander. Con un diseño fresco y elegante, este piso cuenta con espacios abiertos que permiten la entrada de luz natural, creando un ambiente cálido y acogedor. Las comodidades de última generación y los acabados de alta calidad definen esta propiedad. Disfrutarás de la conveniencia de vivir en una ubicación céntrica, con tiendas, restaurantes y lugares de interés cultural a pocos pasos de tu puerta. Este piso de obra nueva está disponible para alquiler y es la opción perfecta para quienes desean la combinación de modernidad y estilo en uno de los lugares más emblemáticos de Santander. ¡No dejes pasar la oportunidad de ser el primero en vivir en esta joya de la arquitectura contemporánea!',
    features: [
      'obra nueva', 'ascensor', 'calefacción', 'camarote', 'cancha de baloncesto',
      'conserje', 'doble ventana', 'gas ciudad', 'piscina cubierta', 'pista de pádel',
      'pista de tenis', 'puerta blindada', 'video portero', 'vigilancia',
      'armario empotrado', 'galería', 'garaje doble', 'linea teléfono',
      'bomba frio calor', 'centros comerciales', 'zonas infantiles', 'arboles',
    ],
    descriptionZone: '',
    privateNotes: '',
    isPublic: true,
    status: 'disponible',
    images: [
      'https://nunibU4IP5.inmocms.com/store/inmuebles/65458abee4dd7_software-inmobiliario-44.jpg',
      'https://nunibU4IP5.inmocms.com/store/inmuebles/65458ad14d83b_software-inmobiliario-11.jpg',
      'https://nunibU4IP5.inmocms.com/store/inmuebles/65458ad14de23_software-inmobiliario-22.jpg',
      'https://nunibU4IP5.inmocms.com/store/inmuebles/65458ad14e33b_software-inmobiliario-33.jpg',
      'https://nunibU4IP5.inmocms.com/store/inmuebles/65458ad14e886_software-inmobiliario-44.jpg',
      'https://nunibU4IP5.inmocms.com/store/inmuebles/65458ad14ed52_software-inmobiliario-55.jpg',
      'https://nunibU4IP5.inmocms.com/store/inmuebles/65458ad14f189_software-inmobiliario-66.jpg',
      'https://nunibU4IP5.inmocms.com/store/inmuebles/65458ad14f59c_software-inmobiliario-77.jpg',
      'https://nunibU4IP5.inmocms.com/store/inmuebles/65458ad14fa8b_software-inmobiliario-88.jpg',
      'https://nunibU4IP5.inmocms.com/store/inmuebles/65458ad14fee8_software-inmobiliario-99.jpg',
    ],
  },
];

/** Get a property by its id */
export function getPropertyById(id: number): Property | undefined {
  return properties.find((p) => p.id === id);
}

/** Format price with currency */
export function formatPrice(price: number, currency: string, freq: string, lang: string = 'es'): string {
  const formatted = new Intl.NumberFormat(lang === 'es' ? 'es-ES' : 'en-GB', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);
  const perMonth = lang === 'es' ? '/mes' : '/month';
  return freq === 'month' ? `${formatted}${perMonth}` : formatted;
}

/** Generate a URL-friendly slug from the property title */
export function propertySlug(property: Property): string {
  return property.title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
