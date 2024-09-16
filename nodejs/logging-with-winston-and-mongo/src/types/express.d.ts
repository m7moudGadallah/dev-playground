import 'express';

declare module 'express' {
  export interface Request {
    requestId?: string;
  }

  export interface Response {
    error?: Error;
  }
}
