import faker from '@faker-js/faker';
import { prisma } from '@/config';

export async function createHotel() {
  return await prisma.hotel.create({
    data: {
      name: faker.name.findName(),
      image: faker.image.imageUrl(),
    },
  });
}

export async function createRoomWithHotelId(hotelId: number) {
  return prisma.room.create({
    data: {
      name: faker.lorem.word(),
      capacity: 3,
      hotelId: hotelId,
    },
  });
}

export async function createRoomAndVariableCapacityWithHotelId(hotelId: number, capacity: number) {
  return prisma.room.create({
    data: {
      name: faker.lorem.word(),
      capacity: capacity,
      hotelId: hotelId,
    },
  });
}
