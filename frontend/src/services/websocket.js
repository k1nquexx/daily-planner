import { Client } from '@stomp/stompjs';

class WebSocketService {
  constructor() {
    this.client = null;
    this.listeners = new Set();
    this.connected = false;
    this.statusListeners = new Set();
  }

  connect() {
    if (this.client && this.client.active) return;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const brokerURL = `${protocol}//${window.location.host}/ws-raw`;

      this.client = new Client({
        brokerURL,
        reconnectDelay: 4000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          this.connected = true;
          this.notifyStatus(true);

          try {
            this.client.subscribe('/topic/sync', (message) => {
              try {
                const event = JSON.parse(message.body);
                this.listeners.forEach((callback) => callback(event));
              } catch (e) {
                console.error('Failed to parse sync message:', e);
              }
            });
          } catch (err) {
            console.warn('Subscription error:', err);
          }
        },
        onDisconnect: () => {
          this.connected = false;
          this.notifyStatus(false);
        },
        onStompError: (frame) => {
          console.warn('STOMP broker error:', frame);
        },
        onWebSocketClose: () => {
          this.connected = false;
          this.notifyStatus(false);
        },
      });

      this.client.activate();
    } catch (e) {
      console.warn('WebSocket connection init failed, will retry:', e);
    }
  }

  disconnect() {
    if (this.client) {
      try {
        this.client.deactivate();
      } catch (e) {}
      this.connected = false;
      this.notifyStatus(false);
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  onStatusChange(callback) {
    this.statusListeners.add(callback);
    callback(this.connected);
    return () => this.statusListeners.delete(callback);
  }

  notifyStatus(status) {
    this.statusListeners.forEach((cb) => cb(status));
  }
}

export const wsService = new WebSocketService();
