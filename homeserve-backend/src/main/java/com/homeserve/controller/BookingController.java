package com.homeserve.controller;

import com.homeserve.dto.BookingRequest;
import com.homeserve.model.*;
import com.homeserve.repository.*;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/bookings")
public class BookingController {
 private final BookingRepository bookings; private final UserRepository users; private final HomeServiceRepository services;
 public BookingController(BookingRepository b,UserRepository u,HomeServiceRepository s){bookings=b;users=u;services=s;}
 @PostMapping public ResponseEntity<?> create(@Valid @RequestBody BookingRequest req){
  AppUser user=users.findById(req.userId()).orElse(null); if(user==null)return ResponseEntity.badRequest().body(Map.of("message","User not found"));
  HomeService service=services.findById(req.serviceId()).orElse(null);if(service==null||!service.isActive())return ResponseEntity.badRequest().body(Map.of("message","Service not found or inactive"));
  Booking b=new Booking();b.setUser(user);b.setService(service);b.setBookingDate(req.bookingDate());b.setBookingTime(req.bookingTime());b.setAddress(req.address().trim());b.setNotes(req.notes());
  return ResponseEntity.status(HttpStatus.CREATED).body(bookings.save(b));
 }
 @GetMapping("/user/{userId}") public ResponseEntity<?> byUser(@PathVariable Long userId){if(!users.existsById(userId))return ResponseEntity.status(404).body(Map.of("message","User not found"));return ResponseEntity.ok(bookings.findByUserIdOrderByCreatedAtDesc(userId));}
 @GetMapping public List<Booking> all(){return bookings.findAll();}
 @PatchMapping("/{id}/status") public ResponseEntity<?> status(@PathVariable Long id,@RequestBody Map<String,String> body){
  String status=body.get("status");if(status==null||!Set.of("PENDING","CONFIRMED","COMPLETED","CANCELLED").contains(status.toUpperCase()))return ResponseEntity.badRequest().body(Map.of("message","Status must be PENDING, CONFIRMED, COMPLETED, or CANCELLED"));
  Booking b=bookings.findById(id).orElse(null);if(b==null)return ResponseEntity.status(404).body(Map.of("message","Booking not found"));b.setStatus(status.toUpperCase());return ResponseEntity.ok(bookings.save(b));
 }
}
