<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import logo from './assets/ui/01_logo.png'
import routeMap from './assets/ui/05_route_map.png'
import cardZaryadye from './assets/ui/08_card_zaryadye.png'
import cardCathedral from './assets/ui/09_card_cathedral_malaya_gruzinskaya.png'
import cardTsaritsyno from './assets/ui/10_card_tsaritsyno.png'
import cardKolomenskoe from './assets/ui/11_card_kolomenskoe.png'
import cardMoscowCity from './assets/ui/12_card_moscow_city.png'
import cardUkraina from './assets/ui/13_card_hotel_ukraina.png'
import cardMsu from './assets/ui/14_card_msu.png'
import cardKremlin from './assets/ui/15_card_kremlin.png'

import detailZaryadye from './assets/detail/detail_zaryadye.jpg'
import detailCathedral from './assets/detail/detail_cathedral.jpg'
import detailTsaritsyno from './assets/detail/detail_tsaritsyno.jpg'
import detailKolomenskoe from './assets/detail/detail_kolomenskoe.jpg'
import detailMoscowCity from './assets/detail/detail_moscow_city.jpg'
import detailUkraina from './assets/detail/detail_ukraina.jpg'
import detailMsu from './assets/detail/detail_msu.jpg'
import detailKremlin from './assets/detail/detail_kremlin.jpg'

type Page = 'home' | 'route' | 'myroute' | 'map' | 'journal' | 'about'

type Destination = {
  id: number
  title: string
  cardTitle: string
  timelineTitle: string
  category: string
  filter: string[]
  time: string
  duration: string
  image: string
  detailImage: string
  description: string
  highlights: string[]
  address: string
  nearestMetro: string
  bestTime: string
  visitPlan: string[]
  walking: string
  metro: string
  taxiHint: string
  map: { x: number; y: number }
  yandexQuery: string
}

type RouteLeg = {
  id: number
  from: string
  to: string
  walking: string
  metro: string
  taxi: string
  tip: string
}

type ServicePlace = {
  id: string
  title: string
  kind: 'Кафе' | 'Ресторан' | 'Перекус' | 'Отдых' | 'Сон' | 'Метро' | 'Фото-точка'
  near: number
  description: string
  time: string
  map: { x: number; y: number }
  yandexQuery: string
}

const filters = ['Все локации', 'История', 'Архитектура', 'Парки', 'Смотровые', 'Фото-точки', 'Избранное']
const activePage = ref<Page>('home')
const activeFilter = ref('Все локации')
const favourites = ref<number[]>([])
const selected = ref<Destination | null>(null)
const activeMapId = ref(1)
const searchQuery = ref('')
const routeStarted = ref(false)
const plannedRoute = ref<number[]>([])
const transportMode = ref<'walk' | 'metro' | 'taxi'>('metro')
const mapMode = ref<'route' | 'food' | 'rest' | 'metro' | 'photo'>('route')
const routeTimeBudget = ref<'short' | 'half' | 'full'>('half')
const routeMood = ref<'photo' | 'history' | 'parks' | 'romantic' | 'family'>('photo')
const dragSourceIndex = ref<number | null>(null)
const isPageLoading = ref(true)
const currentTravelTipIndex = ref(0)
const travelTips = [
  'Сохраняйте 10–15 минут запаса между дальними точками, чтобы маршрут оставался лёгким.',
  'Для лучших фото планируйте панорамные локации на золотой час — ближе к закату.',
  'Держите воду, пауэрбанк и офлайн-карту под рукой, особенно в длинном прогулочном дне.',
  'После большой локации добавляйте короткую паузу в кафе — так маршрут ощущается комфортнее.',
  'Если погода меняется, переносите парки на первую половину дня, а музеи и кафе — на вторую.',
  'Самые красивые городские кадры часто получаются не на главной точке, а по пути между ними.'
]
const currentTravelTip = computed(() => travelTips[currentTravelTipIndex.value])
let loadingTimer: ReturnType<typeof window.setTimeout> | null = null
let travelTipTimer: ReturnType<typeof window.setInterval> | null = null

const destinations: Destination[] = [
  {
    id: 1,
    title: 'Парк «Зарядье»',
    cardTitle: '«Зарядье»',
    timelineTitle: '«Зарядье»',
    category: 'Парк',
    filter: ['Парки', 'Фото-точки'],
    time: '10:00',
    duration: '60 мин',
    image: cardZaryadye,
    detailImage: detailZaryadye,
    description: 'Современное пространство рядом с Кремлём и Красной площадью. Здесь можно увидеть необычную архитектуру, природные зоны, прогулочные террасы и панорамные виды на центр Москвы.',
    highlights: ['Парящий мост', 'вид на Кремль', 'фото-точка у стеклянного купола'],
    address: 'ул. Варварка, 6, Москва',
    nearestMetro: 'Китай-город, Охотный Ряд, Театральная',
    bestTime: 'Утро или закат: меньше людей и мягкий свет для фото.',
    visitPlan: ['Пройти через природные зоны парка', 'Выйти к Парящему мосту', 'Сделать фото с видом на Кремль и Москву-реку'],
    walking: 'От Красной площади 7–10 минут пешком через Варварку.',
    metro: 'Доехать до «Китай-город» или «Охотный Ряд», далее 7–12 минут пешком.',
    taxiHint: 'Удобная точка высадки: улица Варварка или Москворецкая набережная.',
    map: { x: 10, y: 22 },
    yandexQuery: 'Парк Зарядье Москва'
  },
  {
    id: 2,
    title: 'Католический собор Непорочного Зачатия Пресвятой Девы Марии',
    cardTitle: 'Собор на Малой Грузинской',
    timelineTitle: 'Собор на Малой Грузинской',
    category: 'Архитектура',
    filter: ['Архитектура', 'Фото-точки'],
    time: '11:15',
    duration: '45 мин',
    image: cardCathedral,
    detailImage: detailCathedral,
    description: 'Один из самых необычных храмов Москвы. Неоготический стиль, краснокирпичный фасад, высокие шпили и стрельчатые арки напоминают европейскую архитектуру.',
    highlights: ['неоготический фасад', 'вечерняя подсветка', 'органные концерты'],
    address: 'ул. Малая Грузинская, 27/13, Москва',
    nearestMetro: 'Краснопресненская, Баррикадная, Улица 1905 года',
    bestTime: 'Днём для фасада, вечером — для тёплой подсветки.',
    visitPlan: ['Осмотреть главный фасад с площади перед храмом', 'Обойти боковые фасады', 'Проверить расписание концертов, если планируете зайти внутрь'],
    walking: 'От метро «Улица 1905 года» около 12–15 минут пешком.',
    metro: 'Из центра удобнее ехать до «Краснопресненской» или «Улицы 1905 года», далее пешком.',
    taxiHint: 'Такси удобно вызвать до адреса «Малая Грузинская, 27/13».',
    map: { x: 43, y: 25 },
    yandexQuery: 'Католический собор Непорочного Зачатия Малая Грузинская'
  },
  {
    id: 3,
    title: 'Парк «Царицыно»',
    cardTitle: 'Царицыно',
    timelineTitle: 'Царицыно',
    category: 'Парк и усадьба',
    filter: ['Парки', 'История', 'Фото-точки'],
    time: '12:30',
    duration: '90 мин',
    image: cardTsaritsyno,
    detailImage: detailTsaritsyno,
    description: 'Большой музей-заповедник с дворцовым ансамблем, прудами, мостами и зелёными аллеями. Центральная точка — светомузыкальный фонтан на острове.',
    highlights: ['светомузыкальный фонтан', 'дворцовый ансамбль', 'прогулка у воды'],
    address: 'Дольская ул., 1, Москва',
    nearestMetro: 'Царицыно, Орехово',
    bestTime: 'После обеда: можно совместить дворцы, пруды и фонтан.',
    visitPlan: ['Войти со стороны метро «Царицыно»', 'Пройти к фонтану и мостам', 'Завершить прогулку у Большого дворца'],
    walking: 'От метро «Царицыно» 10–15 минут до центральной части парка.',
    metro: 'Ехать по Замоскворецкой линии до «Царицыно» или «Орехово».',
    taxiHint: 'Такси лучше ставить до главного входа музея-заповедника.',
    map: { x: 78, y: 28 },
    yandexQuery: 'Музей заповедник Царицыно Москва'
  },
  {
    id: 4,
    title: 'Музей-заповедник «Коломенское»',
    cardTitle: 'Коломенское',
    timelineTitle: 'Коломенское',
    category: 'История',
    filter: ['История', 'Парки'],
    time: '14:30',
    duration: '75 мин',
    image: cardKolomenskoe,
    detailImage: detailKolomenskoe,
    description: 'Историческая территория с храмами, старинными постройками и живописными пейзажами. Здесь чувствуется атмосфера старой Москвы и древнерусской архитектуры.',
    highlights: ['старинные ворота', 'белокаменные храмы', 'осенние виды'],
    address: 'просп. Андропова, 39, Москва',
    nearestMetro: 'Коломенская, Каширская',
    bestTime: 'Днём или ближе к закату, когда красиво подсвечиваются белые стены.',
    visitPlan: ['Начать от главного входа', 'Пройти к историческим воротам', 'Выйти к смотровым точкам над Москвой-рекой'],
    walking: 'От метро «Коломенская» примерно 10 минут до входа в парк.',
    metro: 'Ехать до «Коломенской» или «Каширской», дальше пешком по указателям.',
    taxiHint: 'Точка высадки: проспект Андропова, главный вход в музей-заповедник.',
    map: { x: 91, y: 58 },
    yandexQuery: 'Коломенское музей заповедник Москва'
  },
  {
    id: 5,
    title: 'Москва-Сити',
    cardTitle: 'Москва-Сити',
    timelineTitle: 'Москва-Сити',
    category: 'Смотровая',
    filter: ['Смотровые', 'Фото-точки', 'Архитектура'],
    time: '16:00',
    duration: '60 мин',
    image: cardMoscowCity,
    detailImage: detailMoscowCity,
    description: 'Современный деловой район столицы. Небоскрёбы из стекла и металла создают образ Москвы как крупного мегаполиса. Одна из лучших точек маршрута для городских фотографий.',
    highlights: ['небоскрёбы', 'набережная', 'вечерние отражения'],
    address: 'Пресненская наб., Москва',
    nearestMetro: 'Деловой центр, Международная, Выставочная',
    bestTime: 'Вечер: стеклянные башни отражают закат и включается подсветка.',
    visitPlan: ['Пройти по набережной', 'Сделать фото с мостов и у башен', 'По желанию подняться на смотровую площадку'],
    walking: 'От станции «Выставочная» 3–5 минут до башен.',
    metro: 'Ехать до «Делового центра», «Выставочной» или «Международной».',
    taxiHint: 'Удобная точка: Пресненская набережная или ТРЦ «Афимолл».',
    map: { x: 16, y: 51 },
    yandexQuery: 'Москва Сити Пресненская набережная'
  },
  {
    id: 6,
    title: 'Гостиница «Украина» и Кутузовский проспект',
    cardTitle: 'Гостиница «Украина»',
    timelineTitle: 'Гостиница «Украина»',
    category: 'Архитектура',
    filter: ['Архитектура', 'Фото-точки'],
    time: '17:15',
    duration: '45 мин',
    image: cardUkraina,
    detailImage: detailUkraina,
    description: 'Одна из знаменитых сталинских высоток Москвы. Монументальное здание со шпилем хорошо видно с Кутузовского проспекта и набережной.',
    highlights: ['сталинская высотка', 'Кутузовский проспект', 'городская перспектива'],
    address: 'Кутузовский просп., 2/1с1, Москва',
    nearestMetro: 'Киевская',
    bestTime: 'Ближе к вечеру: высотка выглядит выразительнее на фоне города.',
    visitPlan: ['Посмотреть здание с набережной', 'Сделать кадр с перспективой Кутузовского проспекта', 'Пройти к мосту в сторону «Киевской»'],
    walking: 'От метро «Киевская» около 8–10 минут пешком.',
    metro: 'Доехать до «Киевской», затем пройти к высотке через площадь и мост.',
    taxiHint: 'Такси можно поставить до входа Radisson Collection Hotel Moscow.',
    map: { x: 37, y: 77 },
    yandexQuery: 'Гостиница Украина Москва Кутузовский проспект'
  },
  {
    id: 7,
    title: 'Главное здание МГУ',
    cardTitle: 'МГУ',
    timelineTitle: 'МГУ (смотровая)',
    category: 'Смотровая',
    filter: ['Смотровые', 'Фото-точки', 'Архитектура'],
    time: '18:15',
    duration: '60 мин',
    image: cardMsu,
    detailImage: detailMsu,
    description: 'Один из главных символов Москвы. Рядом находится смотровая площадка, откуда открывается панорамный вид на город.',
    highlights: ['Воробьёвы горы', 'панорама Москвы', 'вечерняя подсветка'],
    address: 'Ленинские горы, 1, Москва',
    nearestMetro: 'Университет, Ломоносовский проспект, Воробьёвы горы',
    bestTime: 'Закат и вечер: панорама города и подсветка здания.',
    visitPlan: ['Подойти к главному фасаду МГУ', 'Перейти на смотровую площадку', 'Сделать панорамные кадры Москвы'],
    walking: 'От метро «Университет» около 20 минут, от смотровой — 5–7 минут.',
    metro: 'Удобно ехать до «Воробьёвых гор» или «Университета», дальше пешком/на транспорте.',
    taxiHint: 'Такси лучше вызвать до смотровой площадки на Воробьёвых горах.',
    map: { x: 70, y: 73 },
    yandexQuery: 'Главное здание МГУ Воробьевы горы'
  },
  {
    id: 8,
    title: 'Московский Кремль',
    cardTitle: 'Кремль',
    timelineTitle: 'Кремль',
    category: 'История',
    filter: ['История', 'Фото-точки', 'Архитектура'],
    time: '19:30',
    duration: '90 мин',
    image: cardKremlin,
    detailImage: detailKremlin,
    description: 'Исторический центр Москвы и одна из главных достопримечательностей России. Красные стены, башни, купола соборов и вид на Москву-реку создают узнаваемый образ столицы.',
    highlights: ['Кремлёвские стены', 'Москва-река', 'закатный вид'],
    address: 'Московский Кремль, Москва',
    nearestMetro: 'Охотный Ряд, Библиотека им. Ленина, Александровский сад',
    bestTime: 'Закат и вечерняя подсветка — лучший финал маршрута.',
    visitPlan: ['Пройти вдоль Кремлёвской стены', 'Выйти к Александровскому саду', 'Завершить маршрут видом на Москву-реку'],
    walking: 'От «Охотного Ряда» 5–7 минут пешком.',
    metro: 'Ехать до «Охотного Ряда», «Театральной» или «Александровского сада».',
    taxiHint: 'Такси лучше ставить до Манежной площади или Васильевского спуска.',
    map: { x: 60, y: 52 },
    yandexQuery: 'Московский Кремль'
  }
]


const servicePlaces: ServicePlace[] = [
  { id: 'coffee-zaryadye', title: 'Кофе у Зарядья', kind: 'Кафе', near: 1, description: 'Быстрая остановка перед стартом маршрута: кофе, вода, лёгкий завтрак.', time: '15–25 мин', map: { x: 16, y: 31 }, yandexQuery: 'кафе рядом с парком Зарядье Москва' },
  { id: 'snack-center', title: 'Перекус в центре', kind: 'Перекус', near: 2, description: 'Короткая пауза между центром и Малой Грузинской, чтобы не перегружать маршрут.', time: '20–30 мин', map: { x: 36, y: 34 }, yandexQuery: 'кафе рядом Малая Грузинская 27 Москва' },
  { id: 'lunch-tsaritsyno', title: 'Обед у Царицыно', kind: 'Ресторан', near: 3, description: 'Самая удобная большая пауза дня: после прогулки у фонтанов можно спокойно пообедать.', time: '45–70 мин', map: { x: 76, y: 38 }, yandexQuery: 'рестораны рядом Царицыно Москва' },
  { id: 'rest-kolomenskoe', title: 'Тихая пауза в Коломенском', kind: 'Отдых', near: 4, description: 'Зелёная остановка без спешки: скамейки, видовые точки и спокойная прогулка.', time: '20–40 мин', map: { x: 88, y: 62 }, yandexQuery: 'Коломенское места для отдыха Москва' },
  { id: 'dinner-city', title: 'Ужин в Москва-Сити', kind: 'Ресторан', near: 5, description: 'Вечерний сценарий: выбрать ресторан с видом или сделать паузу в Афимолле.', time: '60–90 мин', map: { x: 22, y: 58 }, yandexQuery: 'рестораны Москва-Сити видовые' },
  { id: 'hotel-sleep', title: 'Отель для ночёвки', kind: 'Сон', near: 6, description: 'Если маршрут растянуть на два дня, удобная ночёвка рядом с Киевской и набережными.', time: 'ночёвка', map: { x: 41, y: 76 }, yandexQuery: 'отели рядом гостиница Украина Москва' },
  { id: 'coffee-msu', title: 'Кофе перед закатом', kind: 'Кафе', near: 7, description: 'Короткая остановка перед смотровой площадкой на Воробьёвых горах.', time: '15–25 мин', map: { x: 66, y: 68 }, yandexQuery: 'кафе рядом Воробьевы горы МГУ' },
  { id: 'late-kremlin', title: 'Поздний ужин у Кремля', kind: 'Ресторан', near: 8, description: 'Финальная точка после вечерней прогулки: ужин или чай в центре.', time: '60 мин', map: { x: 58, y: 47 }, yandexQuery: 'рестораны рядом Кремль Москва' },
  { id: 'metro-center', title: 'Метро: Китай-город', kind: 'Метро', near: 1, description: 'Удобный старт для центра и Зарядья.', time: '5–10 мин пешком', map: { x: 12, y: 29 }, yandexQuery: 'метро Китай-город Москва' },
  { id: 'metro-city', title: 'Метро: Деловой центр', kind: 'Метро', near: 5, description: 'Быстрый вход в район Москва-Сити.', time: '3–5 мин пешком', map: { x: 19, y: 47 }, yandexQuery: 'метро Деловой центр Москва' },
  { id: 'photo-zaryadye', title: 'Фото-точка: Парящий мост', kind: 'Фото-точка', near: 1, description: 'Один из самых узнаваемых ракурсов на центр Москвы.', time: '10–15 мин', map: { x: 18, y: 20 }, yandexQuery: 'Парящий мост Зарядье' },
  { id: 'photo-msu', title: 'Фото-точка: Воробьёвы горы', kind: 'Фото-точка', near: 7, description: 'Панорама Москвы и вечерняя подсветка МГУ.', time: '20–30 мин', map: { x: 72, y: 68 }, yandexQuery: 'смотровая площадка Воробьевы горы' }
]

const includedServicePlaces = computed(() => servicePlaces.filter((place) => plannedRoute.value.includes(place.near)))
const servicePlacesForSelected = computed(() => servicePlaces.filter((place) => place.near === activeMapId.value))
const filteredMapServices = computed(() => {
  if (mapMode.value === 'route') return includedServicePlaces.value
  if (mapMode.value === 'food') return servicePlaces.filter((place) => ['Кафе', 'Ресторан', 'Перекус'].includes(place.kind))
  if (mapMode.value === 'rest') return servicePlaces.filter((place) => ['Отдых', 'Сон'].includes(place.kind))
  if (mapMode.value === 'metro') return servicePlaces.filter((place) => place.kind === 'Метро')
  return servicePlaces.filter((place) => place.kind === 'Фото-точка')
})

const routeLegs: RouteLeg[] = [
  { id: 1, from: 'Старт', to: 'Парк «Зарядье»', walking: 'Если вы уже в центре: 7–10 минут от Красной площади.', metro: 'Метро до «Китай-город» или «Охотный Ряд», далее пешком.', taxi: 'Такси до ул. Варварка / Москворецкой набережной.', tip: 'Начните в 10:00, пока парк не перегружен.' },
  { id: 2, from: 'Зарядье', to: 'Собор на Малой Грузинской', walking: 'Пешком долго: лучше оставить как городской перегон.', metro: 'От центра до «Краснопресненской» или «Улицы 1905 года», затем 12–15 минут пешком.', taxi: 'Такси около 20–30 минут без сильных пробок.', tip: 'Собор лучше смотреть с фасада — там самый выразительный ракурс.' },
  { id: 3, from: 'Собор', to: 'Царицыно', walking: 'Пеший вариант не рекомендуется: большое расстояние.', metro: 'Через центр до станции «Царицыно», затем 10–15 минут до парка.', taxi: 'Такси удобно, если маршрут идёт с компанией или плохая погода.', tip: 'Заложите запас времени на вход в парк и прогулку к фонтану.' },
  { id: 4, from: 'Царицыно', to: 'Коломенское', walking: 'Можно строить как прогулочный южный блок, но пешком долго.', metro: 'Доехать от «Царицыно» до «Коломенской» с пересадкой по ситуации.', taxi: 'Самый удобный короткий перегон между парками.', tip: 'В Коломенском выбирайте короткий круг, чтобы не выбиться из расписания.' },
  { id: 5, from: 'Коломенское', to: 'Москва-Сити', walking: 'Пешком не подходит для маршрута одного дня.', metro: 'От «Коломенской» до «Делового центра» / «Выставочной».', taxi: 'Такси экономит силы перед вечерним блоком.', tip: 'В Сити лучше приходить ближе к вечернему свету.' },
  { id: 6, from: 'Москва-Сити', to: 'Гостиница «Украина»', walking: 'Можно пройти пешком вдоль набережных, если есть силы.', metro: 'Короткий перегон до «Киевской» или пеший/наземный вариант.', taxi: 'Такси 10–15 минут при свободной дороге.', tip: 'Сделайте кадр высотки с перспективой Кутузовского проспекта.' },
  { id: 7, from: 'Гостиница «Украина»', to: 'МГУ', walking: 'Пешком долго, но можно сделать отдельный прогулочный маршрут по набережным.', metro: 'Через «Киевскую» до «Университета» или «Воробьёвых гор».', taxi: 'Такси удобно до смотровой площадки.', tip: 'Попробуйте попасть на Воробьёвы горы к закату.' },
  { id: 8, from: 'МГУ', to: 'Кремль', walking: 'Полный пеший вариант подойдёт только как отдельная длинная прогулка.', metro: 'От «Университета» / «Воробьёвых гор» до центра, затем пешком.', taxi: 'Такси до Манежной площади или Васильевского спуска.', tip: 'Финальный вид Кремля лучше оставить на вечернюю подсветку.' }
]

const selectedMap = computed(() => destinations.find((item) => item.id === activeMapId.value) ?? destinations[0])
const routeItems = computed(() => plannedRoute.value.map((id) => destinations.find((item) => item.id === id)).filter(Boolean) as Destination[])
const routeVisitMinutes = computed(() => routeItems.value.reduce((sum, item) => sum + parseInt(item.duration, 10), 0))
const routeTransferMinutes = computed(() => {
  const perLeg = transportMode.value === 'walk' ? 42 : transportMode.value === 'taxi' ? 22 : 30
  return Math.max(0, routeItems.value.length - 1) * perLeg
})
const routeServiceMinutes = computed(() => includedServicePlaces.value.filter((place) => ['Кафе', 'Ресторан', 'Перекус', 'Отдых'].includes(place.kind)).slice(0, Math.max(0, routeItems.value.length - 1)).reduce((sum, place) => sum + (place.kind === 'Ресторан' ? 55 : place.kind === 'Отдых' ? 25 : 20), 0))
const totalRouteMinutes = computed(() => routeVisitMinutes.value + routeTransferMinutes.value + routeServiceMinutes.value)
const formattedTotalTime = computed(() => {
  const hours = Math.floor(totalRouteMinutes.value / 60)
  const minutes = totalRouteMinutes.value % 60
  return totalRouteMinutes.value ? (hours + ' ч ' + (minutes ? minutes + ' мин' : '')) : '0 ч'
})
const routeSmartHint = computed(() => {
  if (!routeItems.value.length) return 'Добавьте 2–4 точки или нажмите автоподбор — приложение соберёт сценарий под ваше настроение.'
  if (totalRouteMinutes.value > 540) return 'Маршрут насыщенный: лучше добавить паузу на обед или убрать одну дальнюю точку.'
  if (routeItems.value.length < 3) return 'Маршрут короткий: можно добавить ещё одну точку или кафе рядом.'
  return 'Маршрут сбалансирован: есть основные места, переезды и паузы для отдыха.'
})
const routeProgress = computed(() => `${Math.round((plannedRoute.value.length / destinations.length) * 100)}%`)
const activeRouteLeg = computed(() => routeLegs.find((leg) => leg.id === activeMapId.value) ?? routeLegs[0])
const selectedLocationRoute = computed(() => routeLegs.find((leg) => leg.id === selected.value?.id))

const visibleCards = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return destinations.filter((item) => {
    const matchesFilter = activeFilter.value === 'Все локации'
      || (activeFilter.value === 'Избранное' ? favourites.value.includes(item.id) : item.filter.includes(activeFilter.value) || item.category === activeFilter.value)
    const matchesSearch = !query || [item.title, item.cardTitle, item.category, item.description, item.address, item.nearestMetro].join(' ').toLowerCase().includes(query)
    return matchesFilter && matchesSearch
  })
})

const journalArticles = [
  { tag: 'Гид', title: 'Как собрать маршрут без усталости', text: 'Не ставьте подряд две дальние точки без паузы: после парка или усадьбы лучше добавить кафе, метро или короткую остановку у воды.' },
  { tag: 'Факт', title: 'Зарядье — парк-контраст', text: 'Здесь соединяются Кремль, Москва-река, стеклянный купол, мост и природные зоны.' },
  { tag: 'Архитектура', title: 'Сталинские высотки как ориентиры', text: 'Гостиница «Украина» и МГУ помогают маршруту перейти от камерного центра к монументальному силуэту города.' },
  { tag: 'Еда', title: 'Где лучше планировать обед', text: 'Для большой паузы удобнее выбирать Царицыно, Коломенское или Москва-Сити: там проще совместить еду и прогулку.' },
  { tag: 'Фото', title: 'Лучший свет для Москва-Сити и МГУ', text: 'Оставляйте эти точки на вечер: стекло, шпили и подсветка смотрятся выразительнее после заката.' },
  { tag: 'Новость', title: 'В проект добавлен автоподбор', text: 'Теперь маршрут можно собрать по времени и настроению: фото, история, парки, романтика или семейный день.' },
  { tag: 'Идея', title: 'Двухдневный режим', text: 'Если добавить ночёвку, приложение может разделить длинный маршрут на два спокойных дня.' },
  { tag: 'Практика', title: 'Когда выбирать такси', text: 'Такси полезно между южными парками и вечерними панорамными точками, чтобы сохранить силы.' }
]

function stopTravelTipRotation() {
  if (travelTipTimer) {
    window.clearInterval(travelTipTimer)
    travelTipTimer = null
  }
}

function startTravelTipRotation() {
  stopTravelTipRotation()
  currentTravelTipIndex.value = Math.floor(Math.random() * travelTips.length)
  travelTipTimer = window.setInterval(() => {
    currentTravelTipIndex.value = (currentTravelTipIndex.value + 1) % travelTips.length
  }, 2100)
}

function showPageLoader(duration = 1400) {
  if (loadingTimer) window.clearTimeout(loadingTimer)
  isPageLoading.value = true
  startTravelTipRotation()
  loadingTimer = window.setTimeout(() => {
    isPageLoading.value = false
    stopTravelTipRotation()
    loadingTimer = null
  }, duration)
}

onMounted(() => {
  showPageLoader(1850)
})

onBeforeUnmount(() => {
  if (loadingTimer) window.clearTimeout(loadingTimer)
  stopTravelTipRotation()
})

function toggleFavourite(id: number) {
  favourites.value = favourites.value.includes(id)
    ? favourites.value.filter((item) => item !== id)
    : [...favourites.value, id]
}

function openDestination(item: Destination) {
  selected.value = item
  activeMapId.value = item.id
}

function addToRoute(id: number) {
  if (!plannedRoute.value.includes(id)) {
    plannedRoute.value = [...plannedRoute.value, id]
  }
}

function removeFromRoute(id: number) {
  plannedRoute.value = plannedRoute.value.filter((item) => item !== id)
}

function toggleRoute(id: number) {
  plannedRoute.value.includes(id) ? removeFromRoute(id) : addToRoute(id)
}

function clearRoute() {
  plannedRoute.value = []
}

function addRecommendedRoute() {
  applyAutoRoute()
}

function applyAutoRoute() {
  const presets: Record<string, Record<string, number[]>> = {
    short: { photo: [1, 8, 5], history: [8, 1, 2], parks: [1, 4, 3], romantic: [1, 5, 8], family: [1, 3, 4] },
    half: { photo: [1, 2, 5, 7, 8], history: [8, 2, 6, 4], parks: [1, 3, 4], romantic: [1, 3, 5, 8], family: [1, 3, 4, 8] },
    full: { photo: [1, 2, 3, 4, 5, 6, 7, 8], history: [8, 2, 6, 7, 4, 3], parks: [1, 3, 4, 7, 8], romantic: [1, 2, 3, 5, 7, 8], family: [1, 3, 4, 5, 8] }
  }
  plannedRoute.value = presets[routeTimeBudget.value][routeMood.value]
  setPage('myroute')
}

function onDragStart(index: number) {
  dragSourceIndex.value = index
}

function onDropRoute(index: number) {
  if (dragSourceIndex.value === null || dragSourceIndex.value === index) return
  const next = [...plannedRoute.value]
  const [moved] = next.splice(dragSourceIndex.value, 1)
  next.splice(index, 0, moved)
  plannedRoute.value = next
  dragSourceIndex.value = null
}

function selectMapPoint(item: Destination) {
  activeMapId.value = item.id
}

function openMapPoint(item: Destination) {
  activeMapId.value = item.id
  selected.value = item
}

function setNextPoint() {
  const currentIndex = destinations.findIndex((item) => item.id === activeMapId.value)
  const next = destinations[(currentIndex + 1) % destinations.length]
  activeMapId.value = next.id
}

function openNextInModal() {
  setNextPoint()
  selected.value = selectedMap.value
}

function setPage(page: Page) {
  if (activePage.value !== page) showPageLoader()
  activePage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function openMapPage() {
  setPage('map')
}

function scrollToMap() {
  setPage('map')
}

function startRoute() {
  routeStarted.value = true
  activeMapId.value = plannedRoute.value[0] ?? activeMapId.value
  setPage('myroute')
}

function yandexMapsUrl(item = selectedMap.value) {
  return `https://yandex.ru/maps/?text=${encodeURIComponent(item.yandexQuery)}`
}

function yandexTaxiUrl(item = selectedMap.value) {
  return `https://taxi.yandex.ru/?destination=${encodeURIComponent(item.address)}`
}

function yandexServiceUrl(place: ServicePlace) {
  return `https://yandex.ru/maps/?text=${encodeURIComponent(place.yandexQuery)}`
}

function openServicePlace(place: ServicePlace) {
  window.open(yandexServiceUrl(place), '_blank', 'noreferrer')
}
</script>

<template>
  <div class="app-shell">
    <Transition name="page-loader">
      <div v-if="isPageLoading" class="travel-loader" role="status" aria-live="polite" aria-label="Загрузка страницы">
        <div class="travel-loader__veil"></div>
        <div class="travel-loader__card">
          <div class="travel-loader__copy">
            <span class="travel-loader__eyebrow">Weekend route · curated journey</span>
            <h2>Подготавливаем следующее путешествие</h2>
            <p>Во время загрузки постепенно строится городской силуэт, а ниже появляются короткие советы для комфортной поездки.</p>

            <div class="travel-loader__tip">
              <span>Совет для путешествия</span>
              <strong>{{ currentTravelTip }}</strong>
            </div>

            <div class="travel-loader__progress" aria-hidden="true">
              <span></span>
            </div>
          </div>

          <div class="loader-scene loader-scene-premium" aria-hidden="true">
            <div class="loader-orbit loader-orbit-one"></div>
            <div class="loader-orbit loader-orbit-two"></div>
            <div class="loader-stage city-stage">
              <div class="loader-stage__halo"></div>
              <div class="city-backline"><span></span><span></span><span></span><span></span><span></span></div>
              <div class="city-crane crane-left"><span class="crane-tower"></span><span class="crane-arm"></span><span class="crane-hook"></span></div>
              <div class="city-crane crane-right"><span class="crane-tower"></span><span class="crane-arm"></span><span class="crane-hook"></span></div>
              <div class="city-building building-one"><span class="city-window-grid"></span></div>
              <div class="city-building building-two"><span class="city-window-grid"></span></div>
              <div class="city-building building-three"><span class="city-window-grid"></span></div>
              <div class="city-building building-four"><span class="city-window-grid"></span></div>
              <div class="city-building building-five"><span class="city-window-grid"></span></div>
              <div class="city-building building-six"><span class="city-window-grid"></span></div>
              <div class="city-ground"></div>
              <div class="city-progress-line"><span></span></div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <div class="decor decor-left" />
    <div class="decor decor-right" />

    <header class="site-header">
      <button class="logo-link clean-button" aria-label="Маршрут выходного дня" @click="setPage('home')">
        <img :src="logo" alt="Маршрут выходного дня" class="logo-img" />
      </button>

      <nav class="top-nav" aria-label="Главная навигация">
        <button :class="{ active: activePage === 'route' }" @click="setPage('route')">Маршруты</button>
        <button :class="{ active: activePage === 'myroute' }" @click="setPage('myroute')">Мой маршрут</button>
        <button @click="setPage('home')">Локации</button>
        <button :class="{ active: activePage === 'map' }" @click="setPage('map')">Карта</button>
        <button :class="{ active: activePage === 'journal' }" @click="setPage('journal')">Журнал</button>
        <button :class="{ active: activePage === 'about' }" @click="setPage('about')">О проекте</button>
      </nav>

      <div class="header-actions">
        <label class="search-field" aria-label="Поиск по Москве">
          <input v-model="searchQuery" placeholder="Поиск по Москве..." @focus="setPage('home')" />
          <span>⌕</span>
        </label>
        <button class="icon-button" :class="{ active: favourites.length }" aria-label="Избранное" @click="activeFilter = 'Избранное'; setPage('home')">♡</button>
        <button class="icon-button bookmark" aria-label="Закладки">⌑</button>
        <button class="profile-button" aria-label="Профиль">
          <span class="avatar">◎</span>
          <span class="chevron">⌄</span>
        </button>
      </div>
    </header>

    <main class="main-layout">
      <template v-if="activePage === 'home'">
        <section class="hero-section" aria-labelledby="main-title">
          <div class="hero-copy">
            <h1 id="main-title">Маршрут<br />выходного дня</h1>
            <p>Откройте для себя многогранную Москву<br />за один день: архитектура, история,<br />парки и лучшие фото-точки столицы.</p>

            <div class="hero-buttons">
              <button class="primary-button" @click="startRoute">Начать маршрут <span>→</span></button>
              <button class="secondary-button" @click="openMapPage"><span class="map-icon">▱</span> Открыть карту</button>
            </div>

            <div class="route-stats" aria-label="Характеристики маршрута">
              <div class="stat-item"><span class="stat-icon">⌖</span><strong>{{ plannedRoute.length }}</strong><small>локаций</small></div>
              <div class="stat-item"><span class="stat-icon">◷</span><strong>1</strong><small>день</small></div>
              <div class="stat-item wide"><span class="stat-icon">▥</span><small>Культура и<br />архитектура</small></div>
              <div class="stat-item wide"><span class="stat-icon">▣</span><small>Фото-точки<br />на маршруте</small></div>
            </div>
          </div>

          <section class="map-panel interactive" aria-label="Интерактивная карта маршрута">
            <img class="route-map-reference" :src="routeMap" alt="Иллюстрированная карта маршрута по Москве" />
            <button v-for="item in destinations" :key="`pin-home-${item.id}`" class="map-pin map-hotspot" :class="{ active: activeMapId === item.id, 'in-route': plannedRoute.includes(item.id) }" :style="{ left: `${item.map.x}%`, top: `${item.map.y}%` }" :aria-label="item.title" @mouseenter="selectMapPoint(item)" @click="openMapPoint(item)">{{ item.id }}</button>
            <button v-for="place in includedServicePlaces" :key="`service-home-${place.id}`" class="service-pin" :class="`kind-${place.kind}`" :style="{ left: `${place.map.x}%`, top: `${place.map.y}%` }" :title="place.title" @click="openServicePlace(place)">{{ place.kind === 'Кафе' ? '☕' : place.kind === 'Ресторан' ? '🍽' : place.kind === 'Сон' ? '☾' : place.kind === 'Отдых' ? '◌' : '•' }}</button>
            <button class="full-map-button" @click="openMapPage">На всю карту</button>
            <div class="map-preview-card">
              <span>Остановка {{ selectedMap.id }}</span>
              <strong>{{ selectedMap.cardTitle }}</strong>
              <small>{{ selectedMap.time }} · {{ selectedMap.duration }}</small>
              <button class="mini-route-action" :class="{ added: plannedRoute.includes(selectedMap.id) }" @click="toggleRoute(selectedMap.id)">{{ plannedRoute.includes(selectedMap.id) ? 'Убрать из маршрута' : 'Добавить в маршрут' }}</button>
            </div>
          </section>
        </section>

        <section class="lower-section" id="locations">
          <div class="locations-area">
            <div class="filters" aria-label="Фильтры локаций">
              <button v-for="filter in filters" :key="filter" :class="['filter-chip', { active: activeFilter === filter }]" @click="activeFilter = filter">{{ filter }}</button>
            </div>

            <div class="cards-grid">
              <article v-for="item in visibleCards" :key="item.id" class="destination-card" :class="{ muted: !plannedRoute.includes(item.id) }" @click="openDestination(item)" @mouseenter="activeMapId = item.id">
                <img :src="item.image" :alt="item.title" />
                <button class="heart-hit" :class="{ active: favourites.includes(item.id) }" aria-label="Добавить в избранное" @click.stop="toggleFavourite(item.id)">{{ favourites.includes(item.id) ? '♥' : '♡' }}</button>
                <button class="card-route-action" :class="{ added: plannedRoute.includes(item.id) }" @click.stop="toggleRoute(item.id)">{{ plannedRoute.includes(item.id) ? '✓ В маршруте' : '+ В маршрут' }}</button>
              </article>
            </div>
            <p v-if="!visibleCards.length" class="empty-state">По этому запросу локаций не найдено. Попробуйте другой фильтр или поиск.</p>
          </div>

          <aside class="timeline-card" aria-label="Ваш маршрут на день">
            <h2>Ваш маршрут на день</h2>
            <div v-if="!routeItems.length" class="empty-route">Пока маршрут пуст. Добавляйте точки с карточек или карты — порядок построится автоматически.</div>
            <ol v-else>
              <li v-for="item in routeItems" :key="item.id" :class="{ active: activeMapId === item.id }" @click="activeMapId = item.id">
                <span class="timeline-index">{{ item.id }}</span>
                <span class="timeline-title">{{ item.timelineTitle }}</span>
                <span class="timeline-time">{{ item.time }}</span>
                <span class="timeline-duration">{{ item.duration }}</span>
                <button class="remove-point" aria-label="Убрать из маршрута" @click.stop="removeFromRoute(item.id)">×</button>
              </li>
            </ol>
            <div class="timeline-summary"><span>◷</span><div><strong>{{ routeItems.length ? 'Маршрут собран: ' + routeItems.length + ' точек' : 'Маршрут ещё не собран' }}</strong><small>{{ routeItems.length ? 'Можно менять состав в один клик' : 'Выберите места, кафе и отдых появятся рядом' }}</small></div></div>
            <button class="secondary-button wide-button" @click="setPage('myroute')">Подробный маршрут</button>
          </aside>
        </section>
      </template>


      <template v-else-if="activePage === 'myroute'">
        <section class="page-hero my-route-hero">
          <span class="eyebrow">Мой маршрут</span>
          <h1>Соберите персональный день в Москве</h1>
          <p>Выберите настроение и время — приложение предложит маршрут. Затем перетаскивайте точки, удаляйте лишнее, добавляйте кафе и открывайте весь план на карте.</p>
          <div class="auto-planner">
            <div>
              <small>Время</small>
              <button :class="{ active: routeTimeBudget === 'short' }" @click="routeTimeBudget = 'short'">3–4 часа</button>
              <button :class="{ active: routeTimeBudget === 'half' }" @click="routeTimeBudget = 'half'">Полдня</button>
              <button :class="{ active: routeTimeBudget === 'full' }" @click="routeTimeBudget = 'full'">Весь день</button>
            </div>
            <div>
              <small>Настроение</small>
              <button :class="{ active: routeMood === 'photo' }" @click="routeMood = 'photo'">Фото</button>
              <button :class="{ active: routeMood === 'history' }" @click="routeMood = 'history'">История</button>
              <button :class="{ active: routeMood === 'parks' }" @click="routeMood = 'parks'">Парки</button>
              <button :class="{ active: routeMood === 'romantic' }" @click="routeMood = 'romantic'">Романтика</button>
              <button :class="{ active: routeMood === 'family' }" @click="routeMood = 'family'">С детьми</button>
            </div>
            <button class="primary-button compact" @click="applyAutoRoute">Автоподбор маршрута</button>
          </div>
        </section>

        <section class="my-route-dashboard">
          <aside class="route-summary-card">
            <span class="eyebrow">Итог дня</span>
            <h2>{{ formattedTotalTime }}</h2>
            <p>{{ routeSmartHint }}</p>
            <div class="summary-metrics">
              <div><strong>{{ routeItems.length }}</strong><span>точек</span></div>
              <div><strong>{{ routeVisitMinutes }}</strong><span>мин на местах</span></div>
              <div><strong>{{ routeTransferMinutes }}</strong><span>мин в пути</span></div>
              <div><strong>{{ includedServicePlaces.length }}</strong><span>пауз рядом</span></div>
            </div>
            <div class="stacked-actions">
              <button class="secondary-button compact" @click="openMapPage">Открыть подробную карту</button>
              <button class="secondary-button compact" @click="clearRoute">Очистить маршрут</button>
            </div>
          </aside>

          <div class="route-dnd-list">
            <div v-if="!routeItems.length" class="empty-route large-empty"><strong>Маршрут пуст</strong><span>Нажмите «Автоподбор маршрута» или добавьте места с карточек. Здесь появится порядок дня.</span></div>
            <article v-for="(item, index) in routeItems" :key="`my-route-${item.id}`" class="my-route-stop" draggable="true" @dragstart="onDragStart(index)" @dragover.prevent @drop="onDropRoute(index)" @mouseenter="activeMapId = item.id">
              <span class="drag-handle">⋮⋮</span>
              <img :src="item.detailImage" :alt="item.title" />
              <div>
                <small>Шаг {{ index + 1 }} · {{ item.category }}</small>
                <h3>{{ item.cardTitle }}</h3>
                <p>{{ item.time }} · {{ item.duration }} · метро: {{ item.nearestMetro }}</p>
                <div class="inline-actions"><button @click="openDestination(item)">Подробнее</button><button @click="removeFromRoute(item.id)">Убрать</button></div>
              </div>
            </article>
          </div>

          <aside class="route-breaks-card">
            <h2>Рекомендации между точками</h2>
            <p v-if="!includedServicePlaces.length">Добавьте точки — рядом появятся кафе, рестораны, отдых, метро и фото-точки.</p>
            <a v-for="place in includedServicePlaces" :key="`break-${place.id}`" :href="yandexServiceUrl(place)" target="_blank" rel="noreferrer" class="service-card extended">
              <span>{{ place.kind }}</span><strong>{{ place.title }}</strong><small>{{ place.description }} · {{ place.time }}</small>
            </a>
          </aside>
        </section>
      </template>

      <template v-else-if="activePage === 'route'">
        <section class="page-hero route-page-hero">
          <span class="eyebrow">Подробный маршрут</span>
          <h1>План прогулки: как добраться между точками</h1>
          <p>Здесь маршрут превращается из лендинга в рабочий сценарий: порядок точек, время, пешие переходы, метро и быстрый переход в Яндекс Карты или Яндекс Такси.</p>
          <div class="mode-switcher">
            <button :class="{ active: transportMode === 'walk' }" @click="transportMode = 'walk'">Пешком</button>
            <button :class="{ active: transportMode === 'metro' }" @click="transportMode = 'metro'">Метро</button>
            <button :class="{ active: transportMode === 'taxi' }" @click="transportMode = 'taxi'">Такси</button>
          </div>
        </section>

        <section class="route-builder route-builder-page" aria-label="Конструктор маршрута">
          <div>
            <span class="eyebrow">Конструктор маршрута</span>
            <h2>Соберите свой день</h2>
          </div>
          <div class="builder-actions">
            <span class="progress-label">{{ plannedRoute.length }} из {{ destinations.length }} точек выбрано</span>
            <div class="progress-track"><span :style="{ width: routeProgress }" /></div>
            <div class="builder-mini-actions"><button @click="addRecommendedRoute">Добавить все</button><button @click="clearRoute">Очистить</button></div>
          </div>
          <div class="route-toggles">
            <button v-for="item in destinations" :key="`route-${item.id}`" class="route-toggle" :class="{ active: plannedRoute.includes(item.id) }" @click="toggleRoute(item.id)"><span>{{ plannedRoute.includes(item.id) ? '✓' : '+' }}</span>{{ item.cardTitle }}</button>
          </div>
        </section>

        <section class="detailed-route-grid">
          <div class="route-steps-list">
            <div v-if="!routeItems.length" class="empty-route large-empty"><strong>Маршрут пуст</strong><span>Добавьте локации выше. После выбора здесь появится подробный план: пешком, метро, такси, кафе и места для отдыха.</span></div>
            <article v-for="item in routeItems" :key="`detail-step-${item.id}`" class="route-step-card" :class="{ active: activeMapId === item.id }" @mouseenter="activeMapId = item.id">
              <img :src="item.detailImage" :alt="item.title" />
              <div class="route-step-content">
                <span class="modal-tag">Остановка {{ item.id }} · {{ item.time }} · {{ item.duration }}</span>
                <h2>{{ item.title }}</h2>
                <p>{{ item.description }}</p>
                <div class="transport-grid">
                  <div><strong>Адрес</strong><span>{{ item.address }}</span></div>
                  <div><strong>Метро рядом</strong><span>{{ item.nearestMetro }}</span></div>
                  <div><strong>Пешком</strong><span>{{ item.walking }}</span></div>
                  <div><strong>На метро</strong><span>{{ item.metro }}</span></div>
                </div>
                <ul class="visit-plan"><li v-for="point in item.visitPlan" :key="point">{{ point }}</li></ul>
                <div class="modal-actions">
                  <a class="primary-button compact link-button" :href="yandexMapsUrl(item)" target="_blank" rel="noreferrer">Открыть в Яндекс Картах</a>
                  <a class="secondary-button compact link-button" :href="yandexTaxiUrl(item)" target="_blank" rel="noreferrer">Вызвать Яндекс Такси</a>
                </div>
              </div>
            </article>
          </div>

          <aside class="transfer-panel">
            <h2>Переезды между точками</h2>
            <p>Выберите режим транспорта выше — карточки покажут самый полезный сценарий для маршрута.</p>
            <div class="service-block">
              <h3>Паузы: кафе, еда, отдых</h3>
              <p v-if="!includedServicePlaces.length">Появятся автоматически после добавления точек в маршрут.</p>
              <a v-for="place in includedServicePlaces" :key="`service-route-${place.id}`" :href="yandexServiceUrl(place)" target="_blank" rel="noreferrer" class="service-card">
                <span>{{ place.kind }}</span><strong>{{ place.title }}</strong><small>{{ place.description }} · {{ place.time }}</small>
              </a>
            </div>
            <article v-for="leg in routeLegs" :key="`leg-${leg.id}`" class="transfer-card" :class="{ active: activeMapId === leg.id }" @click="activeMapId = leg.id">
              <span>{{ leg.from }} →</span>
              <strong>{{ leg.to }}</strong>
              <p v-if="transportMode === 'walk'">{{ leg.walking }}</p>
              <p v-else-if="transportMode === 'metro'">{{ leg.metro }}</p>
              <p v-else>{{ leg.taxi }}</p>
              <small>{{ leg.tip }}</small>
            </article>
          </aside>
        </section>
      </template>

      <template v-else-if="activePage === 'map'">
        <section class="page-hero map-page-title">
          <span class="eyebrow">Подробная карта города</span>
          <h1>Интерактивная карта маршрута</h1>
          <p>Карта теперь работает как отдельный раздел: кликайте по точкам, включайте слои еды, отдыха, метро и фото-точек, открывайте локации в Яндекс Картах.</p>
          <div class="map-mode-switcher">
            <button :class="{ active: mapMode === 'route' }" @click="mapMode = 'route'">Маршрут</button>
            <button :class="{ active: mapMode === 'food' }" @click="mapMode = 'food'">Еда</button>
            <button :class="{ active: mapMode === 'rest' }" @click="mapMode = 'rest'">Отдых</button>
            <button :class="{ active: mapMode === 'metro' }" @click="mapMode = 'metro'">Метро</button>
            <button :class="{ active: mapMode === 'photo' }" @click="mapMode = 'photo'">Фото-точки</button>
          </div>
        </section>

        <section class="city-map-page">
          <div class="large-map-card">
            <img class="route-map-reference large-reference" :src="routeMap" alt="Подробная иллюстрированная карта маршрута" />
            <button v-for="item in destinations" :key="`pin-map-${item.id}`" class="map-pin large map-hotspot" :class="{ active: activeMapId === item.id, 'in-route': plannedRoute.includes(item.id) }" :style="{ left: `${item.map.x}%`, top: `${item.map.y}%` }" :aria-label="item.title" @mouseenter="selectMapPoint(item)" @click="selectMapPoint(item)">{{ item.id }}</button>
            <button v-for="place in filteredMapServices" :key="`service-map-${place.id}`" class="service-pin large-service" :class="`kind-${place.kind}`" :style="{ left: `${place.map.x}%`, top: `${place.map.y}%` }" :title="place.title" @click="openServicePlace(place)">{{ place.kind === 'Кафе' ? '☕' : place.kind === 'Ресторан' ? '🍽' : place.kind === 'Сон' ? '☾' : place.kind === 'Отдых' ? '◌' : '•' }}</button>
            <div class="map-legend">
              <span><i class="legend-dot cafe"></i>Кафе</span>
              <span><i class="legend-dot food"></i>Рестораны</span>
              <span><i class="legend-dot rest"></i>Отдых</span>
              <span><i class="legend-dot sleep"></i>Ночёвка</span>
            </div>
          </div>

          <aside class="map-detail-panel">
            <img :src="selectedMap.detailImage" :alt="selectedMap.title" />
            <span class="modal-tag">Остановка {{ selectedMap.id }} · {{ selectedMap.category }}</span>
            <h2>{{ selectedMap.title }}</h2>
            <p>{{ selectedMap.description }}</p>
            <div class="transport-grid compact-grid">
              <div><strong>Адрес</strong><span>{{ selectedMap.address }}</span></div>
              <div><strong>Метро</strong><span>{{ selectedMap.nearestMetro }}</span></div>
              <div><strong>Лучшее время</strong><span>{{ selectedMap.bestTime }}</span></div>
            </div>
            <div class="transfer-card active">
              <span>Как добраться</span>
              <strong>{{ activeRouteLeg.from }} → {{ activeRouteLeg.to }}</strong>
              <p>{{ transportMode === 'walk' ? activeRouteLeg.walking : transportMode === 'metro' ? activeRouteLeg.metro : activeRouteLeg.taxi }}</p>
            </div>
            <div class="nearby-services">
              <h3>Рядом для паузы</h3>
              <a v-for="place in servicePlacesForSelected" :key="`selected-service-${place.id}`" :href="yandexServiceUrl(place)" target="_blank" rel="noreferrer">
                <span>{{ place.kind }}</span><strong>{{ place.title }}</strong><small>{{ place.time }}</small>
              </a>
            </div>
            <div class="modal-actions stacked-actions">
              <button class="primary-button compact" @click="toggleRoute(selectedMap.id)">{{ plannedRoute.includes(selectedMap.id) ? 'Убрать из маршрута' : 'Добавить в маршрут' }}</button>
              <a class="secondary-button compact link-button" :href="yandexMapsUrl(selectedMap)" target="_blank" rel="noreferrer">Открыть в Яндекс Картах</a>
              <a class="secondary-button compact link-button" :href="yandexTaxiUrl(selectedMap)" target="_blank" rel="noreferrer">Вызвать Яндекс Такси</a>
              <button class="secondary-button compact" @click="setNextPoint">Следующая точка</button>
            </div>
          </aside>
        </section>
      </template>

      <template v-else-if="activePage === 'journal'">
        <section class="page-hero journal-hero">
          <span class="eyebrow">Журнал</span>
          <h1>Городские истории, факты и идеи для прогулки</h1>
          <p>Раздел превращает приложение в живой путеводитель: пользователь не только собирает маршрут, но и понимает, почему эти места важны, где сделать паузу и как выбрать сценарий под настроение.</p>
        </section>
        <section class="journal-layout">
          <article class="featured-article">
            <span>Главная статья</span>
            <h2>Москва за один день: как соединить парки, высотки и исторический центр</h2>
            <p>Оптимальный маршрут лучше строить не только по расстоянию, но и по ритму дня: утром — центр и первые фото, днём — зелёные пространства, вечером — смотровые и подсветка города.</p>
            <button class="primary-button compact" @click="setPage('route')">Собрать маршрут</button>
          </article>
          <div class="journal-cards">
            <article v-for="article in journalArticles" :key="article.title"><span>{{ article.tag }}</span><strong>{{ article.title }}</strong><p>{{ article.text }}</p></article>
          </div>
        </section>
      </template>

      <template v-else>
        <section class="page-hero simple-page"><span class="eyebrow">О проекте</span><h1>Городской маршрут, который можно собрать под себя</h1><p>Проект объединяет визуальный путеводитель, интерактивную карту, конструктор маршрута и быстрые сценарии перемещения по Москве.</p></section>
      </template>
    </main>

    <div v-if="selected" class="modal-backdrop" @click="selected = null">
      <article class="modal-card modal-card-wide" @click.stop>
        <div class="modal-photo">
          <img :src="selected.detailImage" :alt="selected.title" />
          <span class="modal-number">{{ selected.id }}</span>
        </div>
        <div class="modal-content">
          <span class="modal-tag">Остановка {{ selected.id }} · {{ selected.category }}</span>
          <h2>{{ selected.title }}</h2>
          <p>{{ selected.description }}</p>
          <div class="modal-meta"><span>{{ selected.time }}</span><span>{{ selected.duration }}</span><span>{{ selected.nearestMetro }}</span></div>
          <div class="transport-grid compact-grid">
            <div><strong>Пешком</strong><span>{{ selected.walking }}</span></div>
            <div><strong>Метро</strong><span>{{ selected.metro }}</span></div>
            <div><strong>Такси</strong><span>{{ selected.taxiHint }}</span></div>
          </div>
          <ul class="modal-highlights"><li v-for="highlight in selected.highlights" :key="highlight">{{ highlight }}</li></ul>
          <div v-if="selectedLocationRoute" class="transfer-card active"><span>Переход к точке</span><strong>{{ selectedLocationRoute.from }} → {{ selectedLocationRoute.to }}</strong><p>{{ selectedLocationRoute.metro }}</p></div>
          <div class="modal-actions">
            <button class="primary-button compact" @click="toggleRoute(selected.id)">{{ plannedRoute.includes(selected.id) ? 'Убрать из маршрута' : 'Добавить в маршрут' }}</button>
            <a class="secondary-button compact link-button" :href="yandexMapsUrl(selected)" target="_blank" rel="noreferrer">Яндекс Карты</a>
            <a class="secondary-button compact link-button" :href="yandexTaxiUrl(selected)" target="_blank" rel="noreferrer">Яндекс Такси</a>
            <button class="secondary-button compact" @click="openNextInModal">Следующая точка</button>
          </div>
        </div>
        <button class="modal-close" aria-label="Закрыть" @click="selected = null">×</button>
      </article>
    </div>
  </div>
</template>
