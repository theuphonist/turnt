import {
  effect,
  inject,
  Injectable,
  signal,
  WritableSignal,
} from '@angular/core';
import { LocalStorageService, LocalStorageKeys } from './local-storage.service';
import { OmitAutogeneratedProperties } from '../shared/custom-types';
import { moveItemInArray } from '@angular/cdk/drag-drop';

export type PlayerModel = {
  id: number;
  display_name: string;
  color: string;
  position: number;
  avatar_url?: string;
};

export enum PlayerColors {
  Red = '#F34141',
  Orange = '#F38141',
  Yellow = '#F3CC41',
  Green = '#38D048',
  Blue = '#4188F3',
  Violet = '#B041F3',
  Pink = '#F659CA',
  Cyan = '#41D9FB',
  Brown = '#8E744D',
  White = '#D3D3D3',
  Gray = '#767676',
  Black = '#181818',
}

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private readonly localStorageService = inject(LocalStorageService);

  readonly players: WritableSignal<PlayerModel[]>;
  readonly activePlayerId: WritableSignal<number>;

  constructor() {
    this.players = signal(
      (this.localStorageService.getItem(LocalStorageKeys.Players) ??
        []) as PlayerModel[]
    );
    this.activePlayerId = signal(this.players()[0]?.id);
  }

  // update local storage whenever players array changes
  private readonly localStoragePlayerUpdateEffect = effect(() =>
    this.localStorageService.setItem(LocalStorageKeys.Players, this.players())
  );

  createPlayer(newPlayer: OmitAutogeneratedProperties<PlayerModel>) {
    const newId = this.players().length
      ? Math.max(...this.players().map((player) => player.id)) + 1
      : 1;
    this.players.update((players) => [...players, { id: newId, ...newPlayer }]);
  }

  updatePlayer(
    id: number,
    updatedPlayer: Partial<OmitAutogeneratedProperties<PlayerModel>>
  ) {
    this.players.update((players) =>
      players.map((player) =>
        // only override properties declared in updatedPlayer
        player.id === id ? { ...player, ...updatedPlayer } : player
      )
    );
  }

  deletePlayer(id: number) {
    this.players.update((players) =>
      players.filter((player) => player.id !== id)
    );
    this.updatePlayerPositions();
  }

  swapPlayers(playerIndex1: number, playerIndex2: number) {
    this.players.update((players) => {
      const reorderedPlayers = players;
      moveItemInArray(reorderedPlayers, playerIndex1, playerIndex2);
      return reorderedPlayers;
    });
    this.updatePlayerPositions();
  }

  updatePlayerPositions() {
    this.players.update((players) =>
      players.map((player, index) => ({ ...player, position: index }))
    );
  }

  changeActivePlayer() {
    if (this.activePlayerId() === undefined) {
      this.activePlayerId.set(this.players()[0].id);
      return;
    }

    const currentPlayerIndex = this.players().findIndex(
      (player) => player.id === this.activePlayerId()
    );

    const nextPlayerIndex =
      currentPlayerIndex + 1 >= this.players().length
        ? 0
        : currentPlayerIndex + 1;

    this.activePlayerId.set(this.players()[nextPlayerIndex].id);
  }
}
