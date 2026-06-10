import { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { College, FilterState } from '../data/types';

// ─── Router ──────────────────────────────────────────────────────────────────
export type Route =
  | { page: 'home' }
  | { page: 'colleges' }
  | { page: 'detail'; collegeId: string }
  | { page: 'compare' }
  | { page: 'predictor' };

// ─── State ───────────────────────────────────────────────────────────────────
interface AppState {
  route: Route;
  compareList: string[];          // college ids
  savedColleges: string[];        // college ids
  filters: FilterState;
}

const DEFAULT_FILTERS: FilterState = {
  query: '',
  type: '',
  state: '',
  exam: '',
  feeRange: [0, 30],
  minRating: 0,
  sortBy: 'rating',
};

const initialState: AppState = {
  route: { page: 'home' },
  compareList: [],
  savedColleges: [],
  filters: DEFAULT_FILTERS,
};

// ─── Actions ─────────────────────────────────────────────────────────────────
type Action =
  | { type: 'NAVIGATE'; route: Route }
  | { type: 'ADD_TO_COMPARE'; id: string }
  | { type: 'REMOVE_FROM_COMPARE'; id: string }
  | { type: 'CLEAR_COMPARE' }
  | { type: 'TOGGLE_SAVED'; id: string }
  | { type: 'SET_FILTERS'; filters: Partial<FilterState> }
  | { type: 'RESET_FILTERS' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'NAVIGATE':
      return { ...state, route: action.route };
    case 'ADD_TO_COMPARE':
      if (state.compareList.includes(action.id) || state.compareList.length >= 3) return state;
      return { ...state, compareList: [...state.compareList, action.id] };
    case 'REMOVE_FROM_COMPARE':
      return { ...state, compareList: state.compareList.filter(id => id !== action.id) };
    case 'CLEAR_COMPARE':
      return { ...state, compareList: [] };
    case 'TOGGLE_SAVED':
      return {
        ...state,
        savedColleges: state.savedColleges.includes(action.id)
          ? state.savedColleges.filter(id => id !== action.id)
          : [...state.savedColleges, action.id],
      };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.filters } };
    case 'RESET_FILTERS':
      return { ...state, filters: DEFAULT_FILTERS };
    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────
interface AppContextValue {
  state: AppState;
  navigate: (route: Route) => void;
  addToCompare: (id: string) => void;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
  toggleSaved: (id: string) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const value: AppContextValue = {
    state,
    navigate: (route) => dispatch({ type: 'NAVIGATE', route }),
    addToCompare: (id) => dispatch({ type: 'ADD_TO_COMPARE', id }),
    removeFromCompare: (id) => dispatch({ type: 'REMOVE_FROM_COMPARE', id }),
    clearCompare: () => dispatch({ type: 'CLEAR_COMPARE' }),
    toggleSaved: (id) => dispatch({ type: 'TOGGLE_SAVED', id }),
    setFilters: (filters) => dispatch({ type: 'SET_FILTERS', filters }),
    resetFilters: () => dispatch({ type: 'RESET_FILTERS' }),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
export function useFilteredColleges(colleges: College[]) {
  const { state } = useApp();
  const f = state.filters;

  return colleges
    .filter(c => {
      if (f.query) {
        const q = f.query.toLowerCase();
        if (
          !c.name.toLowerCase().includes(q) &&
          !c.shortName.toLowerCase().includes(q) &&
          !c.location.city.toLowerCase().includes(q) &&
          !c.location.state.toLowerCase().includes(q) &&
          !c.tags.some(t => t.toLowerCase().includes(q))
        ) return false;
      }
      if (f.type && c.type !== f.type) return false;
      if (f.state && c.location.state !== f.state) return false;
      if (f.exam && !c.acceptedExams.includes(f.exam as College['acceptedExams'][0])) return false;
      if (c.fees.min > f.feeRange[1] || c.fees.max < f.feeRange[0]) return false;
      if (c.rating < f.minRating) return false;
      return true;
    })
    .sort((a, b) => {
      switch (f.sortBy) {
        case 'rating': return b.rating - a.rating;
        case 'fees-asc': return a.fees.min - b.fees.min;
        case 'fees-desc': return b.fees.max - a.fees.max;
        case 'ranking': return (a.ranking.nirf ?? 999) - (b.ranking.nirf ?? 999);
        case 'name': return a.name.localeCompare(b.name);
        default: return 0;
      }
    });
}
