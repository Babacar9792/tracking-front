import { Component } from '@angular/core';
import { TrackingSenderComponent } from './tracking-sender/tracking-sender.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TrackingSenderComponent],
  template: '<app-tracking-sender></app-tracking-sender>',
  styleUrl: './app.component.scss'
})
export class AppComponent {}
