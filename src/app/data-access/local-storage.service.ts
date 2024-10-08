import { Injectable } from '@angular/core';

export enum LocalStorageKeys {
  Players = 'players',
  Game = 'game',
}

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  setItem(key: string, value: string | object) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  getItem(key: string): string | object | null {
    const item = localStorage.getItem(key);

    if (item === null) {
      return null;
    }

    return JSON.parse(item);
  }
}
