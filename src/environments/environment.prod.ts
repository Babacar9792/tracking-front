declare const window: Window & { __env?: { wsUrl?: string } };

export const environment = {
  production: true,
  get wsUrl(): string {
    const configured = window.__env?.wsUrl;
    if (configured) return configured;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//localhost:8083/ws`;
  },
};
