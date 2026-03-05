export interface HealthStatus {
  service: string;
  database: string;
  uptime: number;
}

export const healthStatusMock: HealthStatus = {
  service: 'UNAVAILABLE',
  database: 'UNAVAILABLE',
  uptime: -1,
};
