export interface APIResponse<T = any> {
  status: 'success' | 'fail' | 'error';
  data?: T;
  results?: number;
  message?: string;
  code?: number;
}
