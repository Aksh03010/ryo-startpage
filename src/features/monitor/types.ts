export type Mode = 'computer' | 'browser';
export type Metric = {
  name: string;
  usage: number | null;
  temperature: number | null;
  index?: number;
  usedBytes?: number;
  totalBytes?: number;
};
export type Snapshot = {
  cpu: Metric;
  gpus: Metric[];
  ram?: Metric | null;
  browser: Metric;
  updatedAt: number;
};
export type MetricsVisibility = { cpu: boolean; gpu1: boolean; gpu2: boolean; ram: boolean };
