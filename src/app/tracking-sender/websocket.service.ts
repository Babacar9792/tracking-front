import { Injectable } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

@Injectable({ providedIn: 'root' })
export class WebsocketService {
  private client: Client | null = null;
  private connectionState$ = new BehaviorSubject<ConnectionState>('disconnected');

  get state$(): Observable<ConnectionState> {
    return this.connectionState$.asObservable();
  }

  get isConnected(): boolean {
    return this.connectionState$.value === 'connected';
  }

  connect(): void {
    if (this.client?.active) return;

    this.connectionState$.next('connecting');

    this.client = new Client({
      brokerURL: environment.wsUrl,
      reconnectDelay: 5000,
      onConnect: () => {
        this.connectionState$.next('connected');
      },
      onDisconnect: () => {
        this.connectionState$.next('disconnected');
      },
      onStompError: () => {
        this.connectionState$.next('error');
      },
      onWebSocketError: () => {
        this.connectionState$.next('error');
      },
    });

    this.client.activate();
  }

  disconnect(): void {
    this.client?.deactivate();
    this.client = null;
    this.connectionState$.next('disconnected');
  }

  send(destination: string, body: object): void {
    if (!this.client?.connected) {
      throw new Error('WebSocket non connecté');
    }
    this.client.publish({
      destination,
      body: JSON.stringify(body),
    });
  }

  subscribe(topic: string, callback: (msg: IMessage) => void): StompSubscription | null {
    if (!this.client?.connected) return null;
    return this.client.subscribe(topic, callback);
  }
}
