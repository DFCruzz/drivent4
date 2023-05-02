import { Booking, Room } from '@prisma/client';
import { prisma } from '@/config';

export type BookingWithRoomInfo = {
  id: number;
  Room: Room;
};

async function findBooking(userId: number): Promise<BookingWithRoomInfo | null> {
  return prisma.booking.findFirst({
    where: {
      userId,
    },
    select: {
      id: true,
      Room: true,
    },
  });
}

async function createBooking(userId: number, roomId: number) {
  return prisma.booking.create({
    data: {
      userId: userId,
      roomId: roomId,
    },
  });
}

async function updateBooking(id: number, roomId: number) {
  return prisma.booking.update({
    where: {
      id: id,
    },
    data: {
      roomId: roomId,
    },
  });
}

async function findRoomByRoomId(roomId: number) {
  return prisma.booking.findMany({
    where: {
      roomId,
    },
  });
}

async function findBookingById(id: number) {
  return prisma.booking.findFirst({
    where: {
      id,
    },
  });
}

export default {
  findBooking,
  createBooking,
  updateBooking,
  findRoomByRoomId,
  findBookingById,
};
