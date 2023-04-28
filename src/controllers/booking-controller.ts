import httpStatus from 'http-status';
import { NextFunction, Response } from 'express';
import bookingService from '@/services/booking-service';
import { AuthenticatedRequest } from '@/middlewares';

async function postBooking(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { userId } = req;
  const { roomId } = req.body;

  try {
    const booking = await bookingService.postBooking(userId, roomId);
    return res.status(httpStatus.OK).send(booking);
  } catch (error) {
    next(error);
  }
}

async function updateBooking(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { userId } = req;
  const { roomId } = req.body;
  const bookingId = Number(req.params.bookingId);

  try {
    const newBooking = await bookingService.updateBooking(bookingId, roomId, userId);
    return res.status(httpStatus.OK).send(newBooking);
  } catch (error) {
    next(error);
  }
}

async function getBooking(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { userId } = req;

  try {
    const userBooking = await bookingService.getBooking(userId);
    return res.status(httpStatus.OK).send(userBooking);
  } catch (error) {
    next(error);
  }
}

export default {
  postBooking,
  updateBooking,
  getBooking,
};
