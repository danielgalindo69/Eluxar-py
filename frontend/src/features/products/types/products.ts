export interface ProductVariant {
  volume: string;
  price: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  type: string;
  price: string;
  image: string;
  hoverImage?: string;
  description: string;
  brand: string;
  gender: 'Unisex' | 'Masculino' | 'Femenino';
  olfactoryFamily: string;
  category: string;
  variants: ProductVariant[];
  stock: number;
  notes: {
    top: string;
    heart: string;
    base: string;
  };
  specs: {
    volume: string;
    longevity: string;
    sillage: string;
  };
}

export const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Santal & Bergamot",
    type: "Extrait de Parfum",
    price: "185.00€",
    image: "https://images.unsplash.com/photo-1760920250029-36af9369a0bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBwZXJmdW1lJTIwYm90dGxlJTIwd2hpdGUlMjBzdHVkaW8lMjBwaG90b2dyYXBoeXxlbnwxfHx8fDE3NzE3MTg3OTl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    hoverImage: "https://images.unsplash.com/photo-1558710347-d8257f52e427?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJmdW1lJTIwc3ByYXklMjBtaXN0JTIwcGhvdG9ncmFwaHklMjBhZXN0aGV0aWN8ZW58MXx8fHwxNzcxNzE4Nzk5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    description: "Una fragancia amaderada y cítrica que redefine la elegancia moderna. El sándalo cremoso se entrelaza con la frescura punzante de la bergamota de Calabria, creando un equilibrio perfecto entre calidez y vitalidad.",
    brand: "Eluxar Signature",
    gender: "Unisex",
    olfactoryFamily: "Amaderada",
    category: "Extrait de Parfum",
    variants: [
      { volume: "30ml", price: 95, stock: 25 },
      { volume: "50ml", price: 125, stock: 18 },
      { volume: "100ml", price: 185, stock: 12 },
    ],
    stock: 55,
    notes: { top: "Bergamota de Calabria, Limón Siciliano", heart: "Sándalo Australiano, Cardamomo", base: "Ámbar Gris, Almizcle Blanco" },
    specs: { volume: "100ml", longevity: "8-10 horas", sillage: "Moderado" },
  },
  {
    id: "2",
    name: "Oud Marine",
    type: "Eau de Parfum",
    price: "210.00€",
    image: "https://images.unsplash.com/photo-1640869116016-93c00ba94b28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bmlzZXglMjBwZXJmdW1lJTIwYm90dGxlJTIwYWVzdGhldGljJTIwZGFyayUyMGJhY2tncm91bmR8ZW58MXx8fHwxNzcxNzE4Nzk5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    description: "El contraste definitivo entre la profundidad oscura del Oud y la frescura salina del océano. Una composición audaz y misteriosa para quienes buscan una firma olfativa única.",
    brand: "Noir Absolu",
    gender: "Masculino",
    olfactoryFamily: "Oriental",
    category: "Eau de Parfum",
    variants: [
      { volume: "50ml", price: 145, stock: 10 },
      { volume: "100ml", price: 210, stock: 7 },
    ],
    stock: 17,
    notes: { top: "Acorde Marino, Sal del Mar", heart: "Madera de Oud, Incienso", base: "Cuero Negro, Pachulí" },
    specs: { volume: "100ml", longevity: "10-12 horas", sillage: "Fuerte" },
  },
  {
    id: "3",
    name: "Iris Concrete",
    type: "Pure Oil",
    price: "155.00€",
    image: "https://images.unsplash.com/photo-1646069762371-132db4250a74?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaWNoZSUyMHBlcmZ1bWUlMjBib3R0bGUlMjBncmV5JTIwYmFja2dyb3VuZHxlbnwxfHx8fDE3NzE3MTg3OTl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    description: "Una oda al minimalismo táctil. El iris absoluto se presenta en su forma más pura y polvorienta, suavizado por una base de madera de cedro. Elegancia en estado puro.",
    brand: "Maison Lumière",
    gender: "Femenino",
    olfactoryFamily: "Floral",
    category: "Pure Oil",
    variants: [
      { volume: "15ml", price: 85, stock: 4 },
      { volume: "50ml", price: 155, stock: 6 },
    ],
    stock: 10,
    notes: { top: "Semilla de Zanahoria, Angélica", heart: "Iris Pallida, Violeta", base: "Madera de Cedro, Vetiver" },
    specs: { volume: "50ml", longevity: "6-8 horas", sillage: "Intimo" },
  },
  {
    id: "4",
    name: "Black Amber",
    type: "Extrait de Parfum",
    price: "195.00€",
    image: "https://images.unsplash.com/photo-1759563874663-1c8f3ef40302?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwcGVyZnVtZSUyMHBhY2thZ2luZyUyMG1pbmltYWxpc3R8ZW58MXx8fHwxNzcxNzE4Nzk5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    description: "Oscuro, resinoso y profundamente envolvente. El ámbar negro se combina con notas de tabaco y vainilla bourbon para crear una fragancia nocturna de una sofisticación inigualable.",
    brand: "Noir Absolu",
    gender: "Unisex",
    olfactoryFamily: "Oriental",
    category: "Extrait de Parfum",
    variants: [
      { volume: "30ml", price: 110, stock: 20 },
      { volume: "100ml", price: 195, stock: 15 },
    ],
    stock: 35,
    notes: { top: "Pimienta Negra, Azafrán", heart: "Ámbar Negro, Tabaco", base: "Vainilla Bourbon, Haba Tonka" },
    specs: { volume: "100ml", longevity: "12+ horas", sillage: "Fuerte" },
  },
  {
    id: "5",
    name: "Vetiver Absolute",
    type: "Eau de Parfum",
    price: "165.00€",
    image: "https://images.unsplash.com/photo-1594035910387-fea081e66b5d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    description: "La esencia terrosa del vetiver haitiano enriquecida con notas verdes y un fondo ahumado sutil. Una fragancia que conecta con la naturaleza más pura.",
    brand: "Eluxar Signature",
    gender: "Masculino",
    olfactoryFamily: "Amaderada",
    category: "Eau de Parfum",
    variants: [
      { volume: "50ml", price: 115, stock: 8 },
      { volume: "100ml", price: 165, stock: 14 },
    ],
    stock: 22,
    notes: { top: "Pomelo, Pimienta Rosa", heart: "Vetiver Haitiano, Geranio", base: "Cedro Ahumado, Musgo de Roble" },
    specs: { volume: "100ml", longevity: "8-10 horas", sillage: "Moderado" },
  },
  {
    id: "6",
    name: "Fleur de Nuit",
    type: "Eau de Parfum",
    price: "175.00€",
    image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    description: "Un ramo nocturno de jazmín y tuberosa que florece bajo la luz de la luna. Sensual, envolvente y magnéticamente femenina.",
    brand: "Maison Lumière",
    gender: "Femenino",
    olfactoryFamily: "Floral",
    category: "Eau de Parfum",
    variants: [
      { volume: "30ml", price: 95, stock: 12 },
      { volume: "50ml", price: 130, stock: 9 },
      { volume: "100ml", price: 175, stock: 6 },
    ],
    stock: 27,
    notes: { top: "Neroli, Pera", heart: "Jazmín Sambac, Tuberosa", base: "Almizcle, Sándalo" },
    specs: { volume: "100ml", longevity: "8-10 horas", sillage: "Moderado" },
  },
  {
    id: "7",
    name: "Rose Noir",
    type: "Extrait de Parfum",
    price: "220.00€",
    image: "https://images.unsplash.com/photo-1563170351-be82bc888aa4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    description: "La rosa turca destilada en su versión más oscura y sofisticada. Notas de cuero y oud crean un contraste dramático con la delicadeza floral.",
    brand: "Noir Absolu",
    gender: "Unisex",
    olfactoryFamily: "Floral",
    category: "Extrait de Parfum",
    variants: [
      { volume: "50ml", price: 155, stock: 3 },
      { volume: "100ml", price: 220, stock: 5 },
    ],
    stock: 8,
    notes: { top: "Rosa de Damasco, Azafrán", heart: "Oud, Rosa Turca", base: "Cuero, Ámbar" },
    specs: { volume: "100ml", longevity: "12+ horas", sillage: "Fuerte" },
  },
  {
    id: "8",
    name: "Citrus Éphémère",
    type: "Eau de Parfum",
    price: "140.00€",
    image: "https://images.unsplash.com/photo-1595425964072-537c688e85fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    description: "Una explosión de cítricos mediterráneos que evoluciona hacia un corazón aromático de salvia y romero. Fresca, luminosa y adictiva.",
    brand: "Eluxar Signature",
    gender: "Unisex",
    olfactoryFamily: "Cítrica",
    category: "Eau de Parfum",
    variants: [
      { volume: "30ml", price: 75, stock: 30 },
      { volume: "50ml", price: 100, stock: 22 },
      { volume: "100ml", price: 140, stock: 18 },
    ],
    stock: 70,
    notes: { top: "Bergamota, Limón de Amalfi, Mandarina", heart: "Salvia, Romero, Petit Grain", base: "Musgo Blanco, Cedro" },
    specs: { volume: "100ml", longevity: "4-6 horas", sillage: "Ligero" },
  },
  {
    id: "9",
    name: "Ambre Sauvage",
    type: "Extrait de Parfum",
    price: "205.00€",
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    description: "Ámbar salvaje de Arabia enriquecido con incienso de Omán y resinas preciosas. Una fragancia ritualística que evoca las noches del desierto.",
    brand: "Noir Absolu",
    gender: "Unisex",
    olfactoryFamily: "Oriental",
    category: "Extrait de Parfum",
    variants: [
      { volume: "50ml", price: 145, stock: 12 },
      { volume: "100ml", price: 205, stock: 9 },
    ],
    stock: 21,
    notes: { top: "Incienso de Omán, Comino", heart: "Ámbar, Benjuí", base: "Resina de Labdanum, Vainilla Ahumada" },
    specs: { volume: "100ml", longevity: "12+ horas", sillage: "Fuerte" },
  },
  {
    id: "10",
    name: "Jardin Suspendu",
    type: "Eau de Parfum",
    price: "160.00€",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    description: "Un paseo por los jardines colgantes de Babilonia recreado a través de acordes verdes, florales y acuáticos. Fresca elegancia botánica.",
    brand: "Maison Lumière",
    gender: "Femenino",
    olfactoryFamily: "Fresca",
    category: "Eau de Parfum",
    variants: [
      { volume: "30ml", price: 85, stock: 16 },
      { volume: "50ml", price: 115, stock: 11 },
      { volume: "100ml", price: 160, stock: 8 },
    ],
    stock: 35,
    notes: { top: "Hoja de Higuera, Menta", heart: "Té Verde, Loto", base: "Bambú, Almizcle Blanco" },
    specs: { volume: "100ml", longevity: "6-8 horas", sillage: "Moderado" },
  },
  {
    id: "11",
    name: "Cuir Fumé",
    type: "Pure Oil",
    price: "190.00€",
    image: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    description: "Cuero ahumado envejecido con madera de agar y un toque de whisky escocés. Para los espíritus más audaces y refinados.",
    brand: "Eluxar Signature",
    gender: "Masculino",
    olfactoryFamily: "Amaderada",
    category: "Pure Oil",
    variants: [
      { volume: "15ml", price: 110, stock: 7 },
      { volume: "50ml", price: 190, stock: 5 },
    ],
    stock: 12,
    notes: { top: "Whisky, Pimienta Negra", heart: "Cuero, Agar", base: "Madera de Guayaco, Alquitrán de Abedul" },
    specs: { volume: "50ml", longevity: "12+ horas", sillage: "Fuerte" },
  },
  {
    id: "12",
    name: "Magnolia Silk",
    type: "Eau de Parfum",
    price: "150.00€",
    image: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    description: "Pétalos de magnolia envueltos en seda. Una fragancia luminosa y aterciopelada que captura la esencia de la feminidad contemporánea.",
    brand: "Maison Lumière",
    gender: "Femenino",
    olfactoryFamily: "Floral",
    category: "Eau de Parfum",
    variants: [
      { volume: "30ml", price: 80, stock: 20 },
      { volume: "50ml", price: 110, stock: 15 },
      { volume: "100ml", price: 150, stock: 10 },
    ],
    stock: 45,
    notes: { top: "Magnolia, Peonía", heart: "Rosa de Mayo, Ylang Ylang", base: "Almizcle Blanco, Cachemira" },
    specs: { volume: "100ml", longevity: "6-8 horas", sillage: "Moderado" },
  },
];
