let memoryStorage: Record<string, string> = {};

function isStorageAvailable(): boolean {
  try {
    if (typeof window === "undefined" || !window.localStorage) return false;
    window.localStorage.setItem('__test__', 'test');
    window.localStorage.removeItem('__test__');
    return true;
  } catch (e) {
    return false;
  }
}

export const safeStorage = {
  get: (key: string): string | null => {
    try {
      if (isStorageAvailable()) return window.localStorage.getItem(key);
    } catch (e) {}
    return memoryStorage[key] || null;
  },
  set: (key: string, value: string): boolean => {
    try {
      if (isStorageAvailable()) {
        window.localStorage.setItem(key, value);
        return true;
      }
    } catch (e) {}
    memoryStorage[key] = value;
    return true;
  },
  remove: (key: string): void => {
    try {
      if (isStorageAvailable()) window.localStorage.removeItem(key);
    } catch (e) {}
    delete memoryStorage[key];
  },
  getItem: (key: string): string | null => safeStorage.get(key),
  setItem: (key: string, value: string): void => { safeStorage.set(key, value); },
  removeItem: (key: string): void => { safeStorage.remove(key); },
};
