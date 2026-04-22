package esprit.tn.eventgestion.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonFormat;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Event {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long eventId;          // clé primaire

 @Column(nullable = false)
 private String title;

 @Column(nullable = false)
 private String type;

 @Column(length = 1000)
 private String description;

 private String location;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm")
 @Column(nullable = false)
 private LocalDateTime startDate;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm")
 @Column(nullable = false)
 private LocalDateTime endDate;

 private int capacity;

 public int getCapacity() {
  return capacity;
 }

 public void setCapacity(int capacity) {
  this.capacity = capacity;
 }

 public String getDescription() {
  return description;
 }

 public void setDescription(String description) {
  this.description = description;
 }

 public LocalDateTime getEndDate() {
  return endDate;
 }

 public void setEndDate(LocalDateTime endDate) {
  this.endDate = endDate;
 }

 public Long getEventId() {
  return eventId;
 }

 public void setEventId(Long eventId) {
  this.eventId = eventId;
 }

 public String getLocation() {
  return location;
 }

 public void setLocation(String location) {
  this.location = location;
 }

 public LocalDateTime getStartDate() {
  return startDate;
 }

 public void setStartDate(LocalDateTime startDate) {
  this.startDate = startDate;
 }

 public String getTitle() {
  return title;
 }

 public void setTitle(String title) {
  this.title = title;
 }

 public String getType() {
  return type;
 }

 public void setType(String type) {
  this.type = type;
 }
}
