/* =============================================
   МАССИВ 1: ТОВАРЫ
   ============================================= */
const products = [
  {
    id: 1,
    name: 'Тёмный Феникс',
    category: 'tea',
    price: 450,
    rating: 4.8,
    tag: 'popular',
    emoji: '🔥',
    desc: 'Насыщенный пуэр с нотами дыма и тёмного шоколада. Основа коллекции «Токийские ночи».',
    img: 'images/puer.webp',
    weight: '100 г'
  },
  {
    id: 2,
    name: 'Алая Маска',
    category: 'tea',
    price: 380,
    rating: 4.6,
    tag: 'popular',
    emoji: '🌹',
    desc: 'Красный чай с лепестками розы и ягодами годжи. Терпкий, насыщенный, незабываемый.',
    img: 'images/red.jpg',
    weight: '80 г'
  },
  {
    id: 3,
    name: 'Призрак Токио',
    category: 'coffee',
    price: 520,
    rating: 4.9,
    tag: 'new',
    emoji: '👻',
    desc: 'Эспрессо-бленд с нотами тёмной вишни и специй. Обжарка по особому рецепту.',
    img: 'images/XiR3DJ7WWKVCMDbbkyC3Q.jpg',
    weight: '200 г'
  },
  {
    id: 4,
    name: 'Кагунэ Бленд',
    category: 'coffee',
    price: 490,
    rating: 4.7,
    tag: 'popular',
    emoji: '🩸',
    desc: 'Авторский кофейный бленд: Эфиопия + Бразилия. Яркая кислотность, ягодное послевкусие.',
    img: 'images/6072225105.jpg',
    weight: '150 г'
  },
  {
    id: 5,
    name: 'Ночной Дозор',
    category: 'tea',
    price: 420,
    rating: 4.5,
    tag: '',
    emoji: '🌑',
    desc: 'Чёрный чай с бергамотом и мускатом. Для вечернего ритуала одиночества.',
    img: 'images/600005386312b9.webp',
    weight: '90 г'
  },
  {
    id: 6,
    name: 'Скрытая Личность',
    category: 'tea',
    price: 350,
    rating: 4.3,
    tag: 'sale',
    emoji: '🎭',
    desc: 'Улун с жасмином и белым персиком. Нежный снаружи — сложный внутри.',
    img: 'images/ylun.webp',
    weight: '75 г'
  },
  {
    id: 7,
    name: 'Первый Гуль',
    category: 'coffee',
    price: 680,
    rating: 5.0,
    tag: 'premium',
    emoji: '☕',
    desc: 'Сингл ориджин Йемен. Ограниченная партия. Ноты кардамона, розы и тёмного мёда.',
    img: 'images/singl.jpg',
    weight: '100 г'
  },
  {
    id: 8,
    name: 'Синтетический Рай',
    category: 'tea',
    price: 290,
    rating: 4.2,
    tag: '',
    emoji: '🍵',
    desc: 'Зелёный матча с кокосовыми нотами. Необычно, парадоксально, аддиктивно.',
    img: 'images/8009588144.jpg',
    weight: '70 г'
  },
  {
    id: 9,
    name: 'Маска Риска',
    category: 'coffee',
    price: 460,
    rating: 4.6,
    tag: 'new',
    emoji: '🕶️',
    desc: 'Кофе холодной обжарки с добавлением тонки-бобов. Смелый выбор.',
    img: 'images/hold.webp',
    weight: '120 г'
  },
  {
    id: 10,
    name: 'Красный Дракон',
    category: 'tea',
    price: 720,
    rating: 4.9,
    tag: 'premium',
    emoji: '🐉',
    desc: 'Выдержанный пуэр 2018 года. Землистый, глубокий, медитативный.',
    img: 'images/puier2.jpg',
    weight: '100 г'
  },
  {
    id: 11,
    name: 'Ова Кен',
    category: 'coffee',
    price: 400,
    rating: 4.4,
    tag: '',
    emoji: '⚡',
    desc: 'Свежеобжаренный кофе из Кении. Цитрус, смородина, яркость.',
    img: 'images/coffe.jpg',
    weight: '180 г'
  },
  {
    id: 12,
    name: 'Токийские Сумерки',
    category: 'tea',
    price: 340,
    rating: 4.4,
    tag: 'sale',
    emoji: '🌆',
    desc: 'Купаж белого и чёрного чая с сушёной сливой. Сложный, меланхоличный.',
    img: 'images/M_height.jpg',
    weight: '80 г'
  }
];

/* =============================================
   МАССИВ 2: ОТЗЫВЫ
   ============================================= */
const reviewsData = [
  {
    id: 1,
    author: 'Канеки К.',
    stars: 5,
    text: 'Тёмный Феникс — это нечто. Пью каждое утро, ощущение как будто погружаешься в другой мир.'
  },
  {
    id: 2,
    author: 'Touka T.',
    stars: 5,
    text: 'Первый Гуль — топ. Ограниченная партия, взяла сразу два пакета. Советую всем!'
  },
  {
    id: 3,
    author: 'Yoshimura S.',
    stars: 4,
    text: 'Качество упаковки и самого чая выше ожиданий. Доставка быстрая, всё пришло целым.'
  },
  {
    id: 4,
    author: 'Hide N.',
    stars: 5,
    text: 'Кагунэ Бленд стал любимым кофе! Отличный баланс кислотности и сладости.'
  }
];

/* Слайды для главной */
const slides = [
  {
    title: 'Anteika',
    sub: 'Авторские чаи и кофе в духе Токийского Гуля',
    btn: 'Перейти в каталог',
    page: 'catalog',
    cls: 'slide--1'
  },
  {
    title: 'Новинки сезона',
    sub: 'Призрак Токио и Маска Риска — попробуй первым',
    btn: 'Смотреть новинки',
    page: 'catalog',
    cls: 'slide--2'
  },
  {
    title: 'Скидка 15%',
    sub: 'На все позиции с меткой SALE до конца месяца',
    btn: 'Забрать скидку',
    page: 'catalog',
    cls: 'slide--3'
  }
];
