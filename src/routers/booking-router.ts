import { Router } from 'express';
import { authenticateToken, validateBody, validateParams } from '@/middlewares';
import bookingController from '@/controllers/booking-controller';
import { bookingParamsSchema, bookingSchema } from '@/schemas/booking-schema';

const bookingRouter = Router();

bookingRouter
  .all('/*', authenticateToken)
  .get('/', bookingController.getBooking)
  .post('/', validateBody(bookingSchema), bookingController.postBooking)
  .put(
    '/:bookingId',
    validateParams(bookingParamsSchema),
    validateBody(bookingSchema),
    bookingController.updateBooking,
  );

export { bookingRouter };
