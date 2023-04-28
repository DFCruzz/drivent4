import { forbiddenError, notFoundError, roomUnavailableError } from '@/errors';
import bookingRepository from '@/repositories/booking-repository';
import roomRepository from '@/repositories/room-repository';

async function verifyRoomAvailability(roomId: number) {
  const room = await roomRepository.findRoomById(roomId);
  if (!room) throw notFoundError();

  const isCapacityMaxed = await bookingRepository.findRoomByRoomId(roomId);
  if (room.capacity === isCapacityMaxed.length) throw roomUnavailableError();
}

async function getBooking(userId: number) {
  const booking = await bookingRepository.findBooking(userId);
  if (!booking) throw notFoundError();

  return booking;
}

async function postBooking(userId: number, roomId: number) {
  await verifyRoomAvailability(roomId);

  const booking = await bookingRepository.createBooking(userId, roomId);

  return booking;
}

async function updateBooking(bookingId: number, roomId: number, userId: number) {
  const userBooking = await bookingRepository.findBooking(userId);
  if (!userBooking) throw forbiddenError();

  await verifyRoomAvailability(roomId);

  const booking = await bookingRepository.findBookingById(bookingId);
  if (!booking) throw notFoundError();

  const newBooking = await bookingRepository.updateBooking(bookingId, roomId);

  return newBooking;
}

const bookingService = {
  getBooking,
  postBooking,
  updateBooking,
};

export default bookingService;
