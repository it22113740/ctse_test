export interface Event {
  id: string;
  title: string;
  date: string;
  venue: string;
}

export interface CreateEventBody {
  title: string;
  date: string;
  venue: string;
}
