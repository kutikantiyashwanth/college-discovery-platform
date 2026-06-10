import { useState, useCallback } from 'react';

const MAX_COMPARE = 3;

export function useCompare() {
  const [compareList, setCompareList] = useState<string[]>([]);

  const addToCompare = useCallback((id: string) => {
    setCompareList(prev => {
      if (prev.includes(id)) return prev;
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  }, []);

  const removeFromCompare = useCallback((id: string) => {
    setCompareList(prev => prev.filter(c => c !== id));
  }, []);

  const isInCompare = useCallback((id: string) => compareList.includes(id), [compareList]);

  const clearCompare = useCallback(() => setCompareList([]), []);

  return { compareList, addToCompare, removeFromCompare, isInCompare, clearCompare, canAdd: compareList.length < MAX_COMPARE };
}
