import Stripe from 'stripe';
import { BookModel } from '../../books/interfaces';
import { AppError } from '../../common/utils';
import { ConfigService } from '../../config/services';
import { RefundModel } from '../../refunds/interfaces';
import { StripeService } from '../../stripe/services';
import {
  CancelOrderInput,
  CancelOrderOutput,
  CreateOrderInput,
  CreateOrderOutput,
  GetOrdersInput,
  GetOrdersOutput,
  OrderModel,
  UpdateOrderInput,
  UpdateOrderOutput,
} from '../interfaces';
import { Types } from 'mongoose';
import { PaymentsService } from '../../payments/services';
import { CustomersService } from '../../customers/services';

interface OrdersServiceOptions {
  services: {
    stripe: StripeService;
    config: ConfigService;
    payments: PaymentsService;
    customers: CustomersService;
  };
  models: {
    book: BookModel;
    order: OrderModel;
    refund: RefundModel;
  };
}

export class OrdersService {
  private readonly services: OrdersServiceOptions['services'];
  private readonly models: OrdersServiceOptions['models'];

  constructor(options: OrdersServiceOptions) {
    const { services, models } = options;
    this.services = services;
    this.models = models;
  }

  async getOrders(getOrdersInput: GetOrdersInput): Promise<GetOrdersOutput> {
    const orders = await this.models.order.find(getOrdersInput.filter);
    return { orders };
  }

  async createOrder(
    createOrderInput: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    // Fetch customer by Id
    const { customers } = await this.services.customers.getCustomers({
      filter: { _id: createOrderInput.customerId },
    });

    if (!customers || customers.length <= 0) {
      throw new AppError(
        404,
        `Can't found user with id [${createOrderInput.customerId}]`,
      );
    }

    const customerEmail =
      (customers[0]?.name as string).split(' ').join('') + '@example.com';
    // Fetch books by IDs
    const books = await this.models.book
      .find({
        _id: { $in: createOrderInput.items.map((item) => item.bookId) },
      })
      .select({ _id: true, title: true, price: true, stock: true });

    // Convert `_id` to string for proper mapping
    const bookMap = new Map(
      books.map((book) => [(book._id as Types.ObjectId).toString(), book]),
    );

    // Prepare line items for Stripe checkout
    const lineItems = createOrderInput.items.map(
      (item): Stripe.Checkout.SessionCreateParams.LineItem => {
        // Convert `item.bookId` to string to match the Map keys
        const book = bookMap.get(item.bookId.toString());
        if (!book) {
          throw new AppError(404, `Can't find book with ID [${item.bookId}]`);
        }
        if (book.stock < item.quantity) {
          throw new AppError(
            400,
            `Book with ID [${item.bookId}] is out of stock`,
          );
        }

        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: book.title,
            },
            unit_amount: book.price * 100, // Convert to cents
          },
          quantity: item.quantity,
        };
      },
    );

    // Create the order in the database
    const order = await this.models.order.create({
      ...createOrderInput,
    });

    // Decrement stock for each book
    await Promise.all(
      createOrderInput.items.map((item) =>
        this.models.book.updateOne(
          { _id: item.bookId },
          { $inc: { stock: -item.quantity } },
        ),
      ),
    );

    // Create a Stripe Checkout session
    const checkoutSession = await this.services.stripe.checkout.sessions.create(
      {
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: lineItems,
        success_url: this.services.config.get('CHECKOUT_SESSION_SUCCESS_URL'),
        cancel_url: this.services.config.get('CHECKOUT_SESSION_CANCEL_URL'),
        metadata: {
          orderId: (order._id as Types.ObjectId).toString(), // Convert order ID to string for metadata
        },
        customer_email: customerEmail,
      },
    );

    console.log(checkoutSession);

    // Create a payment record
    await this.services.payments.createPayment({
      orderId: order._id as string,
      amount: checkoutSession.amount_total || 0, // Handle null value if session is incomplete
      checkoutSessionId: checkoutSession.id,
      transactionId: null,
      status: 'pending',
      paymentMethod: 'stripe',
    });

    return {
      orderId: (order._id as Types.ObjectId).toString(),
      checkoutSessionId: checkoutSession.id,
      checkoutSessionUrl: checkoutSession.url,
    };
  }

  async updateOrder(
    updateOrderInput: UpdateOrderInput,
  ): Promise<UpdateOrderOutput> {
    const order = await this.models.order.findOneAndUpdate(
      { _id: updateOrderInput.orderId },
      { ...updateOrderInput.data, updatedAt: new Date() },
      { new: true },
    );

    if (!order) {
      throw new AppError(
        404,
        `Can't find order with id [${updateOrderInput.orderId}]`,
      );
    }

    return {
      order,
    };
  }

  async cancelOrder(
    cancelOrderInput: CancelOrderInput,
  ): Promise<CancelOrderOutput> {
    const order = await this.models.order.findById(cancelOrderInput.orderId);

    if (!order) {
      throw new AppError(
        404,
        `Can't find order with [${cancelOrderInput.orderId}]`,
      );
    }
    // Calculate the time difference between the order creation and now
    const orderCreationDate = new Date(order.createdAt);
    const currentDate = new Date();
    const timeDifference = currentDate.getTime() - orderCreationDate.getTime();
    const daysDifference = timeDifference / (1000 * 3600 * 24);

    // Check if the order is already canceled or not paid
    if (order.status === 'canceled') {
      throw new AppError(400, 'The order has already been canceled.');
    } else if (order.status === 'pending') {
      order.status = 'canceled';

      // Increment the stock of each book in the order
      await Promise.all(
        order.items.map((item) =>
          this.models.book.updateOne(
            { _id: item.bookId },
            { $inc: { stock: item.quantity } },
          ),
        ),
      );

      await order.save();
      return { refundId: null };
    } else {
      // Check if the order was placed more than 10 days ago
      if (daysDifference > 10) {
        throw new AppError(
          400,
          'The order can no longer be canceled as it was placed more than 10 days ago.',
        );
      }

      const { payments } = await this.services.payments.getPayments({
        filter: { orderId: order._id, status: 'completed' },
      });

      if (!payments || payments.length <= 0) {
        throw new AppError(400, 'No completed payment found for this order.');
      }

      const refund = await this.services.stripe.refunds.create({
        payment_intent: payments[0].transactionId as string,
        amount: payments[0].amount,
      });

      await this.models.refund.create({
        orderId: order._id,
        amount: payments[0].amount,
        paymentId: payments[0]._id,
        transactionId: refund.id,
        status: 'completed',
      });

      // Increment the stock of each book in the order
      await Promise.all(
        order.items.map((item) =>
          this.models.book.updateOne(
            { _id: item.bookId },
            { $inc: { stock: item.quantity } },
          ),
        ),
      );

      order.status = 'canceled';
      await order.save();

      return { refundId: refund.id };
    }
  }
}
