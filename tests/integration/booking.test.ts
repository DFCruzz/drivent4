import httpStatus from 'http-status';
import faker from '@faker-js/faker';
import supertest from 'supertest';
import * as jwt from 'jsonwebtoken';
import { TicketStatus } from '.prisma/client';
import { cleanDb, generateValidToken } from '../helpers';
import {
  createEnrollmentWithAddress,
  createHotel,
  createPayment,
  createRoomWithHotelId,
  createTicket,
  createTicketTypeRemote,
  createTicketTypeWithHotel,
  createUser,
  createBooking,
  createTicketTypeWithoutHotel,
  createRoomAndVariableCapacityWithHotelId,
} from '../factories';
import app, { init } from '@/app';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('GET /booking', () => {
  it('Should respond with status 401 if no token is given', async () => {
    const response = await server.get('/booking');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('Should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('Should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('When token is valid', () => {
    it('Should respond with status 404 if user have no booking', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('Should respond with status 200 and user booking', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const booking = await createBooking(user.id, room.id);

      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual({
        id: booking.id,
        Room: {
          id: room.id,
          name: room.name,
          capacity: room.capacity,
          hotelId: room.hotelId,
          createdAt: room.createdAt.toISOString(),
          updatedAt: room.updatedAt.toISOString(),
        },
      });
    });
  });
});

describe('POST /booking', () => {
  it('Should respond with status 401 if no token is given', async () => {
    const response = await server.get('/booking');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('Should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('Should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('When token is valid', () => {
    it('Should respond with status 400 if body is not found', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it('Should respond with status 400 if body is invalid', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const body = { notRoomId: 'string' };

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);
      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    describe('When body is valid', () => {
      it('Should respond with status 404 if room is not found', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithHotel();
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        const body = { roomId: 999 };

        const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);
        expect(response.status).toBe(httpStatus.NOT_FOUND);
      });

      it('Should respond with status 403 if ticket is remote', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeRemote();
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        const body = { roomId: 1 };

        const response = await server.get('/booking').set('Authorization', `Bearer ${token}`).send(body);

        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it('Should respond with status 403 if ticket doest not include hotel', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithoutHotel();
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        const body = { roomId: 1 };

        const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);
        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it('Should respond with status 403 when ticket was not paid', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithHotel();
        await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
        const body = { roomId: 1 };

        const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);
        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it('Should respond with status 403 if room is unavailable', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithHotel();
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

        const hotel = await createHotel();
        const room = await createRoomAndVariableCapacityWithHotelId(hotel.id, 1);
        await createBooking(user.id, room.id);
        const body = { roomId: room.id };

        const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);
        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it('should respond with status 200 and booking id', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithHotel();
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);
        const body = { roomId: room.id };

        const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);
        expect(response.status).toBe(httpStatus.OK);
        expect(response.body).toEqual({
          bookingId: expect.any(Number),
        });
      });
    });
  });
});
