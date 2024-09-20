import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../common/utils';
import { CancelOrderInput, CreateOrderInput } from './interfaces';
import { OrdersService } from './services';

export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  createOrder = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await this.ordersService.createOrder(
        req.body as CreateOrderInput,
      );

      res.status(201).json({
        status: 'success',
        data: result,
      });
    },
  );

  cancelOrder = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await this.ordersService.cancelOrder(
        req.body as CancelOrderInput,
      );

      res.status(200).json({
        status: 'success',
        data: result,
      });
    },
  );
}
