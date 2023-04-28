import { Booking } from '@prisma/client';
import { notFoundError, roomUnavailableError } from '@/errors';
import bookingRepository from '@/repositories/booking-repository';
import roomRepository from '@/repositories/room-repository';

async function verifyRoomAvailability(roomId: number) {
  const room = await roomRepository.findRoomById(roomId);
  if (!room) throw notFoundError();

  const isCapacityMaxed = await bookingRepository.findRoomByRoomId(roomId);
  if (room.capacity === isCapacityMaxed.length) throw roomUnavailableError();
}
