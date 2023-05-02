import { forbiddenError, notFoundError, roomUnavailableError } from '@/errors';
import bookingRepository from '@/repositories/booking-repository';
import enrollmentRepository from '@/repositories/enrollment-repository';
import roomRepository from '@/repositories/room-repository';
import ticketsRepository from '@/repositories/tickets-repository';

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
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw notFoundError();

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket || ticket.status === 'RESERVED' || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel)
    throw forbiddenError();

  await verifyRoomAvailability(roomId);

  const booking = await bookingRepository.createBooking(userId, roomId);

  return { bookingId: booking.id };
}

async function updateBooking(BookingId: number, roomId: number, userId: number) {
  await verifyRoomAvailability(roomId);

  const userBooking = await bookingRepository.findBooking(userId);
  if (!userBooking) throw forbiddenError();

  const booking = await bookingRepository.findBookingById(BookingId);
  if (!booking) throw notFoundError();

  const newBooking = await bookingRepository.updateBooking(BookingId, roomId);

  return { bookingId: newBooking.id };
}

export default {
  getBooking,
  postBooking,
  updateBooking,
};
