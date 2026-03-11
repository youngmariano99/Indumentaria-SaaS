import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RubroState {
  rubroId: string | null;
  diccionario: Record<string, string>;
  esquema: any[];
  setRubro: (id: string, diccionario: string, esquemaJson?: string) => void;
  translate: (key: string, fallback?: string) => string;
}

export const useRubroStore = create<RubroState>()(
  persist(
    (set, get) => ({
      rubroId: null,
      diccionario: {},
      esquema: [],
      setRubro: (id, diccionarioJson, esquemaJson) => {
        try {
          const dict = JSON.parse(diccionarioJson || '{}');
          const schema = JSON.parse(esquemaJson || '[]');
          set({ rubroId: id, diccionario: dict, esquema: schema });
        } catch (e) {
          console.error('Error parsing rubro data', e);
        }
      },
      translate: (key, fallback) => {
        return get().diccionario[key] || fallback || key;
      },
    }),
    {
      name: 'rubro-storage',
    }
  )
);
