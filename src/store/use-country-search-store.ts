import { create } from 'zustand';

type State = {
    query: string;
    setQuery: (q: string) => void;
};

export const useCountrySearchStore = create<State>((set) => ({
    query: '',
    setQuery: (query) => set({ query }),
}));