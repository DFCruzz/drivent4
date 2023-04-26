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

async function findBooking(bookingId: number): Promise<BookingIdWithRoomAndHotel | null> {
  return prisma.booking.findFirst({
    where: {
      id: bookingId,
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
