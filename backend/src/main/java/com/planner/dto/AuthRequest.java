package com.planner.dto;

public class AuthRequest {
    private String pin;

    public AuthRequest() {}

    public AuthRequest(String pin) {
        this.pin = pin;
    }

    public String getPin() {
        return pin;
    }

    public void setPin(String pin) {
        this.pin = pin;
    }
}
