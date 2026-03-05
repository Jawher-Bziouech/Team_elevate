package esprit.tn.eventgestion.service;

import esprit.tn.eventgestion.Entity.Event;
import esprit.tn.eventgestion.Repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;

    @Override
    public Event addEvent(Event event) {
        return eventRepository.save(event);
    }

    @Override
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    @Override
    public Event getEventById(Long id) {
        return eventRepository.findById(id).orElse(null);
    }

    @Override
    public Event updateEvent(Long id, Event event) {
        Event e = eventRepository.findById(id).orElse(null);
        if (e != null) {
            e.setTitle(event.getTitle());
            e.setDescription(event.getDescription());
            e.setStartDate(event.getStartDate());
            e.setEndDate(event.getEndDate());
            e.setLocation(event.getLocation());
            return eventRepository.save(e);
        }
        return null;
    }

    @Override
    public void deleteEvent(Long id) {
        eventRepository.deleteById(id);
    }
}
