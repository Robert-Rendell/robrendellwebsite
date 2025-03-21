import { BookDogWalkingPayload } from "../payloads/book-dog-walking.payload";

export type DogWalkingCalendarJson = {
  lastUpdated: string;
  bookingsRequested: DogWalkingCalendarEntry[];
  bookingsConfirmed: DogWalkingCalendarEntry[];
};

export type DogWalkingCalendarEntry = {
  acceptedBookingDatetime?: string;
  requestedBookingDatetime?: string;
} & BookDogWalkingPayload;
