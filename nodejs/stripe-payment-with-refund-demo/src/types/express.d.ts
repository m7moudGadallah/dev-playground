import 'express';
import { JsonResponse } from '../common/interfaces';

declare module 'express' {
  export interface Response<
    ResBody = JsonResponse,
    Locals extends Record<string, any> = Record<string, any>,
  > extends core.Response<ResBody, Locals> {}
}
