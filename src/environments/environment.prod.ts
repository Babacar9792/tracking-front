declare const window: Window & { __env?: { wsUrl?: string } };

export const environment = {
  production: true,
  get wsUrl(): string {
    return window.__env?.wsUrl ?? 'http://localhost:8083/ws';
  },
};
