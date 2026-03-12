import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RubroState {
  rubroId: string | null;
  rubroSlug: string | null;
  diccionario: Record<string, string>;
  esquema: any[];
  setRubro: (id: string, slug: string, diccionario: string, esquemaJson?: string) => void;
  translate: (key: string, fallback?: string) => string;
}

export const useRubroStore = create<RubroState>()(
  persist(
    (set, get) => ({
      rubroId: null,
      rubroSlug: null,
      diccionario: {},
      esquema: [],
      setRubro: (id, slug, diccionarioJson, esquemaJson) => {
        try {
          const dict = JSON.parse(diccionarioJson || '{}');
          const schema = JSON.parse(esquemaJson || '[]');
          set({ rubroId: id, rubroSlug: slug, diccionario: dict, esquema: schema });
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
