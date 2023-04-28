import { prisma } from '@/config';

export type BookingIdWithRoomAndHotel = {
  id: number;
  Room: {
    name: string;
    capacity: number;
    Hotel: {
      name: string;
    };
  };
};

async function findBooking(userId: number): Promise<BookingIdWithRoomAndHotel | null> {
  return prisma.booking.findFirst({
    where: {
      userId,
    },
    select: {
      id: true,
      Room: {
        select: {
          name: true,
          capacity: true,
          Hotel: {
            select: {
              name: true,
            },
          },
        },
      },
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
