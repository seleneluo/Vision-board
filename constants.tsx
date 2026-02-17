
import { Category, CategoryInfo } from './types';

export const CHINESE_FONTS = [
  { name: '灵动长意', value: "'Long Cang', cursive" },
  { name: '飘逸行草', value: "'Ma Shan Zheng', cursive" },
  { name: '劲道草书', value: "'Liu Jian Mao Cao', cursive" },
  { name: '质朴手写', value: "'Zhi Mang Xing', cursive" },
  { name: '精致小薇', value: "'ZCOOL XiaoWei', serif" },
  { name: '复古青刻', value: "'ZCOOL QingKe HuangYou', cursive" },
  { name: '快乐体', value: "'ZCOOL KuaiLe', cursive" },
  { name: '雅致宋体', value: "'Noto Serif SC', serif" },
];

export const ENGLISH_FONTS = [
  { name: 'Delafield Script', value: "'Mrs Saint Delafield', cursive" },
  { name: 'Pinyon Elegant', value: "'Pinyon Script', cursive" },
  { name: 'Royal Grace', value: "'Great Vibes', cursive" },
  { name: 'Artistic Caveat', value: "'Caveat', cursive" },
  { name: 'Dancing Script', value: "'Dancing Script', cursive" },
  { name: 'Parisienne', value: "'Parisienne', cursive" },
  { name: 'Classic Serif', value: "'Playfair Display', serif" },
  { name: 'Modern Sans', value: "'Inter', sans-serif" },
];

// Expanded font pool for the "Shuffle" feature
export const POPULAR_GOOGLE_FONTS = {
  zh: [
    { name: 'ZCOOL XiaoWei', label: '小薇Logo体' },
    { name: 'ZCOOL QingKe HuangYou', label: '清刻黄油体' },
    { name: 'ZCOOL KuaiLe', label: '快乐体' },
    { name: 'Ma Shan Zheng', label: '马善政楷书' },
    { name: 'Zhi Mang Xing', label: '知芒星体' },
    { name: 'Liu Jian Mao Cao', label: '刘建毛草' },
    { name: 'Long Cang', label: '龙藏体' },
    { name: 'Noto Serif SC', label: '思源宋体' },
    { name: 'ZCOOL Porter', label: '波特体' },
    { name: 'Noto Sans SC', label: '思源黑体' },
    { name: 'Ma Shan Zheng', label: '马善政' },
    { name: 'ZCOOL QingKe HuangYou', label: '清刻' }
  ],
  en: [
    { name: 'Playfair Display', label: 'Playfair Serif' },
    { name: 'Dancing Script', label: 'Dancing Flow' },
    { name: 'Great Vibes', label: 'Great Vibes' },
    { name: 'Alex Brush', label: 'Alex Brush' },
    { name: 'Satisfy', label: 'Satisfy Script' },
    { name: 'Lobster', label: 'Lobster Modern' },
    { name: 'Cormorant Garamond', label: 'Cormorant Serif' },
    { name: 'Cinzel', label: 'Cinzel Decorative' },
    { name: 'Sacramento', label: 'Sacramento Thin' },
    { name: 'Parisienne', label: 'Parisienne French' },
    { name: 'Pinyon Script', label: 'Pinyon Elegant' },
    { name: 'Mrs Saint Delafield', label: 'Delafield Script' },
    { name: 'Montserrat', label: 'Modern Sans' },
    { name: 'Lora', label: 'Classic Serif' },
    { name: 'Pacifico', label: 'Pacifico Wave' },
    { name: 'Abril Fatface', label: 'Abril Bold' },
    { name: 'Amatic SC', label: 'Amatic Hand' },
    { name: 'Cookie', label: 'Cookie Script' },
    { name: 'Kaushan Script', label: 'Kaushan Artistic' },
    { name: 'Allura', label: 'Allura Script' },
    { name: 'Yellowtail', label: 'Yellowtail Script' },
    { name: 'Oswald', label: 'Oswald Bold' },
    { name: 'Marck Script', label: 'Marck Script' },
    { name: 'Italianno', label: 'Italianno Elegance' },
    { name: 'Tangerine', label: 'Tangerine Slim' },
    { name: 'Monsieur La Doulaise', label: 'Royal Mono' },
    { name: 'Herr Von Muellerhoff', label: 'Muellerhoff' }
  ]
};

export const ALL_FONTS = [...CHINESE_FONTS, ...ENGLISH_FONTS];

export const CATEGORIES: CategoryInfo[] = [
  {
    id: Category.CAREER,
    description: "Your professional legacy and work environment.",
    icon: 'Briefcase',
    suggestions: ["Dream office setup", "Professional milestones", "Work-life balance scenes"]
  },
  {
    id: Category.WEALTH,
    description: "Financial abundance and the life it enables.",
    icon: 'Coins',
    suggestions: ["Ideal purchases", "Asset goals", "Freedom of choice"]
  },
  {
    id: Category.HEALTH,
    description: "Vitality, strength, and physical well-being.",
    icon: 'Activity',
    suggestions: ["Morning routines", "Fitness goals", "Nourishing meals"]
  },
  {
    id: Category.GROWTH,
    description: "Skills, wisdom, and lifelong learning.",
    icon: 'BookOpen',
    suggestions: ["Certificates", "A specific book stack", "New skills in action"]
  },
  {
    id: Category.FAMILY,
    description: "Intimate connections and domestic bliss.",
    icon: 'Heart',
    suggestions: ["Home warmth", "Partner qualities", "Family traditions"]
  },
  {
    id: Category.SOCIAL,
    description: "Friendships, community, and support systems.",
    icon: 'Users',
    suggestions: ["Social gatherings", "Mentors", "Community impact"]
  },
  {
    id: Category.PUBLIC_WELFARE,
    description: "Giving back and making a social impact.",
    icon: 'Globe',
    suggestions: ["Volunteering scenes", "Charity impact", "Community service"]
  },
  {
    id: Category.INTERESTS,
    description: "Hobbies, passions, and creative pursuits.",
    icon: 'Palette',
    suggestions: ["Creative studio", "Hobby milestones", "Joyful moments"]
  }
];

export const MOCK_ITEMS: any[] = [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=1000',
    category: Category.CAREER,
    title: 'Modern Workspace',
    affirmation: 'I am creating impactful work in an environment that inspires me daily.',
    fontFamily: CHINESE_FONTS[0].value,
    createdAt: Date.now()
  },
  {
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1000',
    category: Category.HEALTH,
    title: 'Morning Yoga',
    affirmation: 'My body is strong, flexible, and filled with radiant energy.',
    fontFamily: ENGLISH_FONTS[1].value,
    createdAt: Date.now() - 100000
  },
  {
    id: '3',
    imageUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=1000',
    category: Category.INTERESTS,
    title: 'Artistic Pursuit',
    affirmation: 'I nourish my soul through creative expression and curiosity.',
    fontFamily: CHINESE_FONTS[1].value,
    createdAt: Date.now() - 200000
  }
];
