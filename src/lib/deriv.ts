"use client";

const APP_ID = 1089;
const WS_URL = `wss://ws.derivws.com/websockets/v3?app_id=${APP_ID}`;
const API_TOKEN = 'jLcvdUQ4sYUtFxE';

export type TickData = {
  quote: number;
  symbol: string;
  epoch: number;
};

export class DerivClient {
  private ws: WebSocket | null = null;
  private subscribers: ((data: TickData) => void)[] = [];
  private historySubscribers: ((data: TickData[]) => void)[] = [];
  private currentSymbol: string = 'R_10';
  private isAuthorized: boolean = false;

  connect(symbol: string = 'R_10') {
    if (this.ws && this.currentSymbol === symbol && this.ws.readyState === WebSocket.OPEN) {
      return;
    }
    
    this.currentSymbol = symbol;
    if (this.ws) {
      if (this.ws.readyState === WebSocket.OPEN && this.isAuthorized) {
        this.switchSymbol(symbol);
      }
      return;
    }

    this.ws = new WebSocket(WS_URL);

    this.ws.onopen = () => {
      console.log('Connected to Deriv WebSocket');
      this.isAuthorized = true;
      this.subscribe(this.currentSymbol);
    };

    this.ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      
      // Removed authorization message handler

      if (data.tick) {
        const tick: TickData = {
          quote: data.tick.quote,
          symbol: data.tick.symbol,
          epoch: data.tick.epoch,
        };
        this.subscribers.forEach(cb => cb(tick));
      }

      if (data.history) {
        const historyTicks: TickData[] = data.history.prices.map((price: number, i: number) => ({
          quote: price,
          symbol: this.currentSymbol,
          epoch: data.history.times[i],
        }));
        this.historySubscribers.forEach(cb => cb(historyTicks));
      }
    };

    this.ws.onclose = () => {
      console.log('Disconnected from Deriv');
      this.ws = null;
      this.isAuthorized = false;
      setTimeout(() => this.connect(this.currentSymbol), 3000);
    };
  }

  private authorize() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        authorize: API_TOKEN
      }));
    }
  }

  private subscribe(symbol: string) {
    if (this.ws?.readyState === WebSocket.OPEN && this.isAuthorized) {
      // 1. Clear old subscriptions
      this.ws.send(JSON.stringify({ forget_all: "ticks" }));
      
      // 2. Fetch last 1000 ticks for percentage sync
      this.ws.send(JSON.stringify({
        ticks_history: symbol,
        adjust_start_time: 1,
        count: 1000,
        end: "latest",
        style: "ticks"
      }));

      // 3. Start live subscription
      this.ws.send(JSON.stringify({
        ticks: symbol,
        subscribe: 1
      }));
    }
  }

  switchSymbol(symbol: string) {
    if (this.currentSymbol === symbol && this.ws?.readyState === WebSocket.OPEN) return;
    
    this.currentSymbol = symbol;
    if (this.ws?.readyState === WebSocket.OPEN && this.isAuthorized) {
      this.ws.send(JSON.stringify({
        forget_all: "ticks"
      }));
      setTimeout(() => this.subscribe(symbol), 500);
    }
  }

  onTick(callback: (data: TickData) => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  onHistory(callback: (data: TickData[]) => void) {
    this.historySubscribers.push(callback);
    return () => {
      this.historySubscribers = this.historySubscribers.filter(cb => cb !== callback);
    };
  }
}

export const derivClient = new DerivClient();
