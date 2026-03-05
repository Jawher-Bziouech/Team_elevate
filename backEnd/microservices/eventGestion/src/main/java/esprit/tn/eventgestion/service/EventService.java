package esprit.tn.eventgestion.service;

import esprit.tn.eventgestion.Entity.Event;

import java.util.List;

public interface EventService {
    Event addEvent(Event event);
    List<Event> getAllEvents();
    Event getEventById(Long id);
    Event updateEvent(Long id, Event event);
    void deleteEvent(Long id);
}
