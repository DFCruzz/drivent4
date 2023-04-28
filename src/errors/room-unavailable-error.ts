import { ApplicationError } from '@/protocols';

export function roomUnavailableError(): ApplicationError {
  return {
    name: 'RoomUnavailableError',
    message: 'Room is currently unavailable',
  };
}
