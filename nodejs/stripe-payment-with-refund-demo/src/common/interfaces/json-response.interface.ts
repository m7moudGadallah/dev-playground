export interface JsonResponse {
  status: 'success' | 'error' | 'fail';
  data?: any;
  message?: string | string[];
  details?: any;
}
