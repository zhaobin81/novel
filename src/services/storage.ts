import { WorldDesign, Character, Outline, Chapter, APIConfig, Novel } from '../types';

const STORAGE_KEYS = {
  API_CONFIG: 'novel_agent_api_config',
  WORLD_DESIGN: 'novel_agent_world_design',
  CHARACTERS: 'novel_agent_characters',
  OUTLINE: 'novel_agent_outline',
  CHAPTERS: 'novel_agent_chapters',
  NOVEL: 'novel_agent_novel',
};

export const storage = {
  getAPIConfig: (): APIConfig | null => {
    const data = localStorage.getItem(STORAGE_KEYS.API_CONFIG);
    return data ? JSON.parse(data) : null;
  },

  setAPIConfig: (config: APIConfig): void => {
    localStorage.setItem(STORAGE_KEYS.API_CONFIG, JSON.stringify(config));
  },

  getWorldDesign: (): WorldDesign | null => {
    const data = localStorage.getItem(STORAGE_KEYS.WORLD_DESIGN);
    return data ? JSON.parse(data) : null;
  },

  setWorldDesign: (world: WorldDesign): void => {
    localStorage.setItem(STORAGE_KEYS.WORLD_DESIGN, JSON.stringify(world));
  },

  getCharacters: (): Character[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CHARACTERS);
    return data ? JSON.parse(data) : [];
  },

  setCharacters: (characters: Character[]): void => {
    localStorage.setItem(STORAGE_KEYS.CHARACTERS, JSON.stringify(characters));
  },

  addCharacter: (character: Character): void => {
    const characters = storage.getCharacters();
    characters.push(character);
    storage.setCharacters(characters);
  },

  updateCharacter: (character: Character): void => {
    const characters = storage.getCharacters();
    const index = characters.findIndex(c => c.id === character.id);
    if (index !== -1) {
      characters[index] = character;
      storage.setCharacters(characters);
    }
  },

  deleteCharacter: (id: string): void => {
    const characters = storage.getCharacters().filter(c => c.id !== id);
    storage.setCharacters(characters);
  },

  getOutline: (): Outline | null => {
    const data = localStorage.getItem(STORAGE_KEYS.OUTLINE);
    return data ? JSON.parse(data) : null;
  },

  setOutline: (outline: Outline): void => {
    localStorage.setItem(STORAGE_KEYS.OUTLINE, JSON.stringify(outline));
  },

  getChapters: (): Chapter[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CHAPTERS);
    return data ? JSON.parse(data) : [];
  },

  setChapters: (chapters: Chapter[]): void => {
    localStorage.setItem(STORAGE_KEYS.CHAPTERS, JSON.stringify(chapters));
  },

  addChapter: (chapter: Chapter): void => {
    const chapters = storage.getChapters();
    chapters.push(chapter);
    storage.setChapters(chapters);
  },

  updateChapter: (chapter: Chapter): void => {
    const chapters = storage.getChapters();
    const index = chapters.findIndex(c => c.id === chapter.id);
    if (index !== -1) {
      chapters[index] = chapter;
      storage.setChapters(chapters);
    }
  },

  getNovel: (): Novel | null => {
    const data = localStorage.getItem(STORAGE_KEYS.NOVEL);
    return data ? JSON.parse(data) : null;
  },

  setNovel: (novel: Novel): void => {
    localStorage.setItem(STORAGE_KEYS.NOVEL, JSON.stringify(novel));
  },

  clearAll: (): void => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },
};
