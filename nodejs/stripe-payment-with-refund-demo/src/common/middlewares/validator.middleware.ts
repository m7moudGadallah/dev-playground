import { Request, Response, NextFunction } from 'express';
import { EndPointValidationSchema } from '../interfaces';
import { AppError, catchAsync, TAsyncHandler } from '../utils';

export class ValidatorMiddleware {
  constructor() {}

  validate(...schemas: EndPointValidationSchema[]): TAsyncHandler {
    return catchAsync(
      async (req: Request, res: Response, next: NextFunction) => {
        for (let schema of schemas) {
          if (req.method !== schema.method) {
            return next(
              new AppError(
                500,
                `Invalid validation schema, expected [${schema.method}] method but found [${req.method}] method!`,
              ),
            );
          }
          await this.applyPreValidation(schema, req, res);
          await this.applyValidationAndTransformation(schema, req);
          await this.applyPostValidation(schema, req, res);
        }
        next();
      },
    );
  }

  private async applyPreValidation(
    endpointSchema: EndPointValidationSchema,
    req: Request,
    res: Response,
  ): Promise<void> {
    if (endpointSchema.preValidation)
      await endpointSchema.preValidation(req, res);
  }

  private async applyValidationAndTransformation(
    endpointSchema: EndPointValidationSchema,
    req: Request,
  ): Promise<void> {
    const { schema: joiSchema, target } = endpointSchema;

    // Validate the request data against the schema
    const { error, value } = joiSchema.validate(req[target]);

    // If there is an error, return it to the client
    if (error) {
      // Replace the double quotes in the error message
      let message = error.message.replace(/"/g, '');

      // Extract text inside [ref:txt] and remove brackets
      message = message.replace(/\[ref:(.*?)\]/g, '$1');

      // Return the error to the client
      throw new AppError(400, message);
    }

    // If there is no error, assign the validated value to the request property
    req[target] = value;
  }

  private async applyPostValidation(
    endpointSchema: EndPointValidationSchema,
    req: Request,
    res: Response,
  ): Promise<void> {
    if (endpointSchema.postValidation)
      await endpointSchema.postValidation(req, res);
  }
}
