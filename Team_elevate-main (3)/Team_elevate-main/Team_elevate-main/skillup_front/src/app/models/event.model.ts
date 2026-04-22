export interface appEvent {
  eventId?: number;
  title: string;
  type: string;
  description?: string;
  location?: string;
  startDate: any;
  endDate: any;
  capacity: number;
  status?: string;
  category?: string;
  price?: number;
  currency?: string;
  registeredCount?: number;
  organizer?: { name: string; email?: string };
  tags?: string[];
  rating?: number;
  reviews?: number;
  isFeatured?: boolean;
  priority?: string;
}

export interface EventStats {
  totalEvents: number;
  upcomingEvents: number;
  ongoingEvents: number;
  completedEvents: number;
  totalParticipants?: number;
  averageRating?: number;
  revenue?: number;
  popularCategories?: any[];
  eventsByMonth?: any[];
  reviews?: number;
}
