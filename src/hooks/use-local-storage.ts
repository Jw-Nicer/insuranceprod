
"use client";

import { useState, useEffect } from 'react';

// A helper function to safely get the initial value from localStorage
function getStoredValue<T>(key: string, initialValue: T): T {
  if (typeof window === "undefined") {
    return initialValue;
  }
  try {
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : initialValue;
  } catch (error) {
    console.warn(`Error reading localStorage key “${key}”:`, error);
    return initialValue;
  }
}


export function useLocalStorage<T>(key: string, initialValue: T) {
  // Pass a function to useState so it only runs on the client's first render.
  const [storedValue, setStoredValue] = useState(() => getStoredValue(key, initialValue));

  // This effect will only run on the client, after hydration.
  // It ensures that if the localStorage value changes in another tab, we update our state.
  useEffect(() => {
    setStoredValue(getStoredValue(key, initialValue));
    
    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === key) {
            setStoredValue(getStoredValue(key, initialValue));
        }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, initialValue]);


  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key “${key}”:`, error);
    }
  };

  return [storedValue, setValue] as const;
}
