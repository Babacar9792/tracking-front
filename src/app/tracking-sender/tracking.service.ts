import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { switchMap, filter } from 'rxjs/operators';
import { WebsocketService } from './websocket.service';
import { GeolocationService, GpsPosition } from './geolocation.service';

export interface PositionMessage {
  trajetId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  speed?: number;
}

export interface TrackingLog {
  time: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

@Injectable({ providedIn: 'root' })
export class TrackingService implements OnDestroy {
  private readonly SEND_INTERVAL_MS = 5000;

  private tracking$ = new BehaviorSubject<boolean>(false);
  private logs$ = new BehaviorSubject<TrackingLog[]>([]);
  private lastPosition: GpsPosition | null = null;

  private gpsSub: Subscription | null = null;
  private intervalSub: Subscription | null = null;
  private stompSub: any = null;
  private livePositions$ = new BehaviorSubject<PositionMessage[]>([]);

  get isTracking$() { return this.tracking$.asObservable(); }
  get trackingLogs$() { return this.logs$.asObservable(); }
  get livePositionsFeed$() { return this.livePositions$.asObservable(); }

  constructor(
    private wsService: WebsocketService,
    private geoService: GeolocationService
  ) {}

  start(trajetId: string): void {
    if (this.tracking$.value) return;

    this.livePositions$.next([]);
    this.tracking$.next(true);
    this.addLog('Démarrage du tracking...', 'info');

    this.wsService.connect();

    // Watch GPS
    this.gpsSub = this.geoService.watch().subscribe((result) => {
      if (typeof result === 'string') {
        this.addLog(`Erreur GPS : ${result}`, 'error');
      } else {
        this.lastPosition = result;
      }
    });

    // Send position on interval
    this.intervalSub = interval(this.SEND_INTERVAL_MS)
      .pipe(filter(() => this.wsService.isConnected && this.lastPosition !== null))
      .subscribe(() => {
        this.sendPosition(trajetId);
      });

    // Subscribe to live topic once connected
    const checkConnected = setInterval(() => {
      if (this.wsService.isConnected) {
        clearInterval(checkConnected);
        this.subscribeToTopic(trajetId);
      }
    }, 500);
  }

  stop(): void {
    if (!this.tracking$.value) return;

    this.gpsSub?.unsubscribe();
    this.intervalSub?.unsubscribe();
    this.stompSub?.unsubscribe();
    this.geoService.stopWatch();
    this.wsService.disconnect();

    this.gpsSub = null;
    this.intervalSub = null;
    this.stompSub = null;
    this.lastPosition = null;
    this.tracking$.next(false);
    this.addLog('Tracking arrêté.', 'info');
  }

  private sendPosition(trajetId: string): void {
    if (!this.lastPosition) return;

    const msg: PositionMessage = {
      trajetId,
      latitude: this.lastPosition.latitude,
      longitude: this.lastPosition.longitude,
      timestamp: new Date(this.lastPosition.timestamp).toISOString(),
    };

    if (this.lastPosition.speed !== null) {
      msg.speed = this.lastPosition.speed;
    }

    try {
      this.wsService.send('/app/position', msg);
      this.addLog(
        `Position envoyée — lat: ${msg.latitude.toFixed(5)}, lng: ${msg.longitude.toFixed(5)}`,
        'success'
      );
    } catch (e) {
      this.addLog('Échec envoi position', 'error');
    }
  }

  private subscribeToTopic(trajetId: string): void {
    this.stompSub = this.wsService.subscribe(
      `/topic/trajet/${trajetId}`,
      (msg) => {
        try {
          const pos: PositionMessage = JSON.parse(msg.body);
          const current = this.livePositions$.value;
          this.livePositions$.next([pos, ...current].slice(0, 50));
          this.addLog(`Reçu : lat ${pos.latitude.toFixed(5)}, lng ${pos.longitude.toFixed(5)}`, 'info');
        } catch {}
      }
    );
    this.addLog(`Abonné à /topic/trajet/${trajetId}`, 'info');
  }

  private addLog(message: string, type: TrackingLog['type']): void {
    const log: TrackingLog = {
      time: new Date().toLocaleTimeString(),
      message,
      type,
    };
    const current = this.logs$.value;
    this.logs$.next([log, ...current].slice(0, 100));
  }

  clearLogs(): void {
    this.logs$.next([]);
  }

  ngOnDestroy(): void {
    this.stop();
  }
}