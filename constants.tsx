
import React from 'react';
import { Category, CategoryInfo } from './types';
import { 
  Briefcase, 
  Coins, 
  Activity, 
  BookOpen, 
  Heart, 
  Users, 
  Compass, 
  Sparkles 
} from 'lucide-react';

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
    id: Category.LEISURE,
    description: "Adventure, hobbies, and world discovery.",
    icon: 'Compass',
    suggestions: ["Destination landmarks", "Creative hobbies", "Travel logs"]
  },
  {
    id: Category.SPIRITUAL,
    description: "Inner peace, mindset, and soul alignment.",
    icon: 'Sparkles',
    suggestions: ["Meditation spaces", "Quiet moments", "Personal values"]
  }
];

export const MOCK_ITEMS: any[] = [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=1000',
    category: Category.CAREER,
    title: 'Modern Workspace',
    affirmation: 'I am creating impactful work in an environment that inspires me daily.',
    createdAt: Date.now()
  },
  {
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1000',
    category: Category.HEALTH,
    title: 'Morning Yoga',
    affirmation: 'My body is strong, flexible, and filled with radiant energy.',
    createdAt: Date.now() - 100000
  },
  {
    id: '3',
    imageUrl: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&q=80&w=1000',
    category: Category.LEISURE,
    title: 'Amalfi Coast',
    affirmation: 'I embrace the beauty of the world and seek new horizons.',
    createdAt: Date.now() - 200000
  },
  {
    id: '4',
    imageUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=1000',
    category: Category.SPIRITUAL,
    title: 'Zen Sanctuary',
    affirmation: 'I am at peace with myself and the universe.',
    createdAt: Date.now() - 300000
  }
];
