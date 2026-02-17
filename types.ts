
export enum Category {
  CAREER = 'Career & Business',
  WEALTH = 'Wealth & Finance',
  HEALTH = 'Health & Vitality',
  GROWTH = 'Learning & Growth',
  FAMILY = 'Family & Love',
  SOCIAL = 'Social & Network',
  PUBLIC_WELFARE = 'Public Welfare',
  INTERESTS = 'Interests'
}

export type ItemType = 'photo' | 'note';

export interface VisionAuditData {
  score?: number;
  value?: string;
  analysis: string;
  isTrueNeed?: boolean;
}

export interface BoardItem {
  id: string;
  imageUrl: string;
  category: Category;
  title: string;
  affirmation: string;
  createdAt: number;
  x: number;
  y: number;
  width?: number;
  rotation?: number;
  audit?: VisionAuditData;
  type?: ItemType;
  color?: string; // For sticky notes
  pinColor?: string; // Custom push-pin color
  fontFamily?: string; // Custom font for the card
}

export interface Connection {
  fromId: string;
  toId: string;
}

export interface CategoryInfo {
  id: Category;
  description: string;
  suggestions: string[];
  icon: string;
}
