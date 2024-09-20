import { Request, Response, NextFunction } from 'express';
import { CustomersService } from './services';
import { catchAsync } from '../common/utils';

export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  getCustomers = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { customers } = await this.customersService.getCustomers({
        filter: {},
      });
      res.status(200).json({
        status: 'success',
        data: {
          customers,
          count: customers.length,
        },
      });
    },
  );
}
