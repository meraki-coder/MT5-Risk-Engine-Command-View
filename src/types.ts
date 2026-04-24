export interface TickData {
  symbol: string;
  bid: number;
  ask: number;
  volume: number;
  datetime_iso?: string;
  datetime?: number;
}

export interface ClientData {
  login: number;
  status: string;
  balance: number;
  equity: number;
  margin: number;
  margin_free: number;
  open_profit: number;
  open_positions: number;
}

export interface PositionData {
  ticket: number;
  login: number;
  symbol: string;
  action: string;
  volume: number;
  price_open: number;
  price_current: number;
  profit: number;
  sl: number;
  tp: number;
  time_update?: number;
  time_create?: number;
}

export interface PositionsSnapshotPayload {
  positions: PositionData[];
}
