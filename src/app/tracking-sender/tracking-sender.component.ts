import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TrackingService, TrackingLog, PositionMessage } from './tracking.service';
import { WebsocketService, ConnectionState } from './websocket.service';

@Component({
  selector: 'app-tracking-sender',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tracking-sender.component.html',
  styleUrls: ['./tracking-sender.component.scss'],
})
export class TrackingSenderComponent implements OnInit, OnDestroy {
  trajetId = 'bb2318de-f845-4b8b-a439-d5b15fa00f0f';
  isTracking = false;
  connectionState: ConnectionState = 'disconnected';
  logs: TrackingLog[] = [];
  livePositions: PositionMessage[] = [];

  private subs: Subscription[] = [];

  constructor(
    public trackingService: TrackingService,
    private wsService: WebsocketService
  ) {}

  ngOnInit(): void {
    this.subs.push(
      this.trackingService.isTracking$.subscribe((v) => (this.isTracking = v)),
      this.trackingService.trackingLogs$.subscribe((logs) => (this.logs = logs)),
      this.trackingService.livePositionsFeed$.subscribe((pos) => (this.livePositions = pos)),
      this.wsService.state$.subscribe((s) => (this.connectionState = s))
    );
  }

  generateId(): void {
    this.trajetId = 'trajet-' + Math.random().toString(36).substring(2, 9);
  }

  startTracking(): void {
    if (!this.trajetId.trim()) return;
    this.trackingService.start(this.trajetId.trim());
  }

  stopTracking(): void {
    this.trackingService.stop();
  }

  clearLogs(): void {
    this.trackingService.clearLogs();
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }
}
