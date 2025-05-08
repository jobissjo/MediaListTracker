import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private storage = localStorage;

  constructor() {}

  /**
   * Set an item in local storage
   */
  setItem(key: string, value: any): void {
    try {
      const serializedValue = JSON.stringify(value);
      this.storage.setItem(key, serializedValue);
    } catch (error) {
      console.error('Error saving to localStorage', error);
    }
  }

  /**
   * Get an item from local storage
   */
  getItem<T>(key: string): T | null {
    try {
      const item = this.storage.getItem(key);
      return item ? JSON.parse(item) as T : null;
    } catch (error) {
      console.error('Error getting from localStorage', error);
      return null;
    }
  }

  /**
   * Remove an item from local storage
   */
  removeItem(key: string): void {
    this.storage.removeItem(key);
  }

  /**
   * Clear all items from local storage
   */
  clear(): void {
    this.storage.clear();
  }
}
