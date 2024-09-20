export class AppError extends Error {
  public isOperational: boolean;
  public status: 'fail' | 'error';

  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.isOperational = true;
    this.status = this.statusCode >= 500 ? 'error' : 'fail';
    Error.captureStackTrace(this, this.constructor);
  }
}
