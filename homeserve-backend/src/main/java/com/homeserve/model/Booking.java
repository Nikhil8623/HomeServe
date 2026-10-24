package com.homeserve.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name="bookings")
public class Booking {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional=false,fetch=FetchType.EAGER) @JoinColumn(name="user_id") private AppUser user;
    @ManyToOne(optional=false,fetch=FetchType.EAGER) @JoinColumn(name="service_id") private HomeService service;
    @Column(nullable=false) private LocalDate bookingDate;
    @Column(nullable=false) private LocalTime bookingTime;
    @Column(nullable=false,length=500) private String address;
    @Column(length=1000) private String notes;
    @Column(nullable=false,length=20) private String status="PENDING";
    @Column(nullable=false) private LocalDateTime createdAt=LocalDateTime.now();
    public Booking(){}
    public Long getId(){return id;} public AppUser getUser(){return user;} public void setUser(AppUser v){user=v;}
    public HomeService getService(){return service;} public void setService(HomeService v){service=v;}
    public LocalDate getBookingDate(){return bookingDate;} public void setBookingDate(LocalDate v){bookingDate=v;}
    public LocalTime getBookingTime(){return bookingTime;} public void setBookingTime(LocalTime v){bookingTime=v;}
    public String getAddress(){return address;} public void setAddress(String v){address=v;}
    public String getNotes(){return notes;} public void setNotes(String v){notes=v;}
    public String getStatus(){return status;} public void setStatus(String v){status=v;}
    public LocalDateTime getCreatedAt(){return createdAt;}
}
