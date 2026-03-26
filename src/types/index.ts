export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface WorldDesign {
  id: string;
  name: string;
  map?: string;
  factions: Faction[];
  locations: Location[];
  createdAt: number;
  updatedAt: number;
}

export interface Faction {
  id: string;
  name: string;
  description: string;
  influence: string;
}

export interface Location {
  id: string;
  name: string;
  description: string;
  significance: string;
}

export interface Character {
  id: string;
  name: string;
  role: string;
  appearance: string;
  personality: string;
  background: string;
  relationships: string;
  createdAt: number;
  updatedAt: number;
}

export interface Outline {
  id: string;
  title: string;
  worldConstruction: string;
  mainStory: string;
  characterDesign: string;
  chapterOutlines: ChapterOutline[];
  createdAt: number;
  updatedAt: number;
}

export interface ChapterOutline {
  id: string;
  number: number;
  skeleton: string;
  content: string;
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  content: string;
  outlineId: string;
  createdAt: number;
  updatedAt: number;
}

export interface Novel {
  id: string;
  title: string;
  worldDesignId?: string;
  characterIds: string[];
  outlineId?: string;
  chapters: Chapter[];
  createdAt: number;
  updatedAt: number;
}

export interface APIConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export interface AppState {
  apiConfig: APIConfig | null;
  currentWorldDesign: WorldDesign | null;
  characters: Character[];
  currentOutline: Outline | null;
  chapters: Chapter[];
  novel: Novel | null;
}
