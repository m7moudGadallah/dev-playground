import { ObjectSchema } from 'joi';

export interface EndPointValidationSchema {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'; // HTTP method
  schema: ObjectSchema; // Joi validation schema
  target: 'body' | 'query' | 'params'; // Where to validate in the request
  preValidation?: (req: any, res: any) => Promise<void>; // Pre-validation function (optional)
  postValidation?: (req: any, res: any) => Promise<void>; // Post-validation function (optional)
}