package com.valtech.vehicle.vehicleapi.controllers;

import com.valtech.vehicle.vehicleapi.dto.Vehicle;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/vehicle")
public class VehicleController {


    @GetMapping
    public Vehicle getVehicle() {
        return new Vehicle("123");
    }
}

