export interface Booking {
  id: string;
  eventId: string;
  attendeeName: string;
  seats: number;
  createdAt: string;
}

export interface CreateBookingBody {
  eventId: string;
  attendeeName: string;
  seats: number;
}
