import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { User, SavedComparison } from '../types';

interface AuthContextValue {
  user: User | null;
  savedColleges: string[];
  savedComparisons: SavedComparison[];
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  toggleSaveCollege: (id: string) => void;
  isCollegeSaved: (id: string) => boolean;
  saveComparison: (name: string, collegeIds: string[]) => void;
  removeSavedComparison: (id: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'cd_auth';
const USERS_KEY = 'cd_users';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [savedColleges, setSavedColleges] = useState<string[]>([]);
  const [savedComparisons, setSavedComparisons] = useState<SavedComparison[]>([]);

  // Restore session on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const { user, savedColleges, savedComparisons } = JSON.parse(raw);
        setUser(user);
        setSavedColleges(savedColleges || []);
        setSavedComparisons(savedComparisons || []);
      }
    } catch { /* ignore */ }
  }, []);

  // Persist on change
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, savedColleges, savedComparisons }));
    }
  }, [user, savedColleges, savedComparisons]);

  const getUsers = (): Record<string, { password: string; user: User }> => {
    try { return JSON.parse(localStorage.getItem(USERS_KEY) || '{}'); }
    catch { return {}; }
  };

  const signup = useCallback(async (name: string, email: string, password: string) => {
    if (!name.trim() || !email.trim() || !password.trim())
      return { ok: false, error: 'All fields are required.' };
    if (!/\S+@\S+\.\S+/.test(email))
      return { ok: false, error: 'Invalid email address.' };
    if (password.length < 6)
      return { ok: false, error: 'Password must be at least 6 characters.' };

    const users = getUsers();
    if (users[email.toLowerCase()])
      return { ok: false, error: 'An account with this email already exists.' };

    const newUser: User = {
      id: `u_${Date.now()}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      avatar: name.trim().slice(0, 2).toUpperCase(),
      joinedAt: new Date().toISOString(),
    };
    users[email.toLowerCase()] = { password, user: newUser };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    setUser(newUser);
    setSavedColleges([]);
    setSavedComparisons([]);
    return { ok: true };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (!email.trim() || !password.trim())
      return { ok: false, error: 'Please enter email and password.' };

    const users = getUsers();
    const record = users[email.toLowerCase().trim()];
    if (!record) return { ok: false, error: 'No account found with this email.' };
    if (record.password !== password) return { ok: false, error: 'Incorrect password.' };

    setUser(record.user);
    setSavedColleges([]);
    setSavedComparisons([]);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setSavedColleges([]);
    setSavedComparisons([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const toggleSaveCollege = useCallback((id: string) => {
    setSavedColleges(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  }, []);

  const isCollegeSaved = useCallback((id: string) => savedColleges.includes(id), [savedColleges]);

  const saveComparison = useCallback((name: string, collegeIds: string[]) => {
    const comp: SavedComparison = {
      id: `cmp_${Date.now()}`,
      name,
      collegeIds,
      savedAt: new Date().toISOString(),
    };
    setSavedComparisons(prev => [comp, ...prev]);
  }, []);

  const removeSavedComparison = useCallback((id: string) => {
    setSavedComparisons(prev => prev.filter(c => c.id !== id));
  }, []);

  return (
    <AuthContext.Provider value={{
      user, savedColleges, savedComparisons,
      login, signup, logout,
      toggleSaveCollege, isCollegeSaved,
      saveComparison, removeSavedComparison,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
