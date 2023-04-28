import { Booking } from '@prisma/client';
import { notFoundError, roomUnavailableError } from '@/errors';
import bookingRepository, { BookingIdWithRoomAndHotel } from '@/repositories/booking-repository';
import roomRepository from '@/repositories/room-repository';

async function verifyRoomAvailability(roomId: number) {
  const room = await roomRepository.findRoomById(roomId);
  if (!room) throw notFoundError();

  const isCapacityMaxed = await bookingRepository.findRoomByRoomId(roomId);
  if (room.capacity === isCapacityMaxed.length) throw roomUnavailableError();
}

async function getBooking(userId: number): Promise<BookingIdWithRoomAndHotel> {
  const booking = await bookingRepository.findBooking(userId);
  if (!booking) throw notFoundError();

  return booking;
}
