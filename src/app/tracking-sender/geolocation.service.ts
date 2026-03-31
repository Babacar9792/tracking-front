import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface GpsPosition {
  latitude: number;
  longitude: number;
  speed: number | null;
  timestamp: number;
}

export type GpsError = 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'UNSUPPORTED';

@Injectable({ providedIn: 'root' })
export class GeolocationService {
  private watchId: number | null = null;

  watch(): Observable<GpsPosition | GpsError> {
    return new Observable((observer) => {
      if (!navigator.geolocation) {
        observer.next('UNSUPPORTED');
        observer.complete();
        return;
      }

      this.watchId = navigator.geolocation.watchPosition(
        (pos) => {
          observer.next({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            speed: pos.coords.speed,
            timestamp: pos.timestamp,
          });
        },
        (err) => {
          switch (err.code) {
            case GeolocationPositionError.PERMISSION_DENIED:
              observer.next('PERMISSION_DENIED');
              break;
            case GeolocationPositionError.POSITION_UNAVAILABLE:
              observer.next('POSITION_UNAVAILABLE');
              break;
            case GeolocationPositionError.TIMEOUT:
              observer.next('TIMEOUT');
              break;
            default:
              observer.next('POSITION_UNAVAILABLE');
          }
        },
        {
          enableHighAccuracy: true,
          maximumAge: 1000,
          timeout: 10000,
        }
      );

      return () => this.stopWatch();
    });
  }

  stopWatch(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }
}