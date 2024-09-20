import { EndPointValidationSchema } from '../../common/interfaces';
import * as joi from 'joi';
import { Types } from 'mongoose';

export const cancelOrderSchema: EndPointValidationSchema = {
  method: 'POST',
  schema: joi
    .object({
      orderId: joi
        .custom((value, helpers) => {
          if (!Types.ObjectId.isValid(value)) {
            return helpers.message({ custom: 'Invalid orderId' });
          }
          return value;
        })
        .required(),
    })
    .prefs({ abortEarly: false, stripUnknown: true }),
  target: 'body',
};
