import { useState } from 'react';

export const useLocalStorage = (keyName: string, defaultValue: object) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const value: string | null = window.localStorage.getItem(keyName);

      if (value) {
        return JSON.parse(value);
      } else {
        window.localStorage.setItem(keyName, JSON.stringify(defaultValue));
        return defaultValue;
      }
    } catch (err: unknown) {
      console.log(err);
      return defaultValue;
    }
  });

  const setValue = (newValue: object) => {
    try {
      window.localStorage.setItem(keyName, JSON.stringify(newValue));
    } catch (err: unknown) {
      console.log(err);
    }
    setStoredValue(newValue);
  };

  return [storedValue, setValue];
};