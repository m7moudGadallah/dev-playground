import { EndPointValidationSchema } from '../../common/interfaces';
import * as joi from 'joi';
import { Types } from 'mongoose';

export const createOrderSchema: EndPointValidationSchema = {
  method: 'POST',
  schema: joi
    .object({
      customerId: joi
      .custom((value, helpers) => {
        if (!Types.ObjectId.isValid(value)) {
          return helpers.message({ custom: 'Invalid customerId' });
        }
        return value;
      })
      .required(),
      items: joi
        .array()
        .items(
          joi.object({
            bookId: joi
              .custom((value, helpers) => {
                if (!Types.ObjectId.isValid(value)) {
                  return helpers.message({ custom: 'Invalid bookId' });
                }
                return value;
              })
              .required(),
            quantity: joi.number().integer().positive().required(),
          }),
        )
        .min(1)
        .required(),
    })
    .prefs({ abortEarly: false, stripUnknown: true }),
  target: 'body',
};
