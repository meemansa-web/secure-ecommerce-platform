package com.ecommerce.dto.request;

import jakarta.validation.constraints.NotBlank;

public class SendOtpRequest {

    @NotBlank(message = "Email or mobile number is required")
    private String identifier;

    private String purpose = "LOGIN";

    public SendOtpRequest() {
    }

    public SendOtpRequest(String identifier, String purpose) {
        this.identifier = identifier;
        this.purpose = purpose != null ? purpose : "LOGIN";
    }

    public String getIdentifier() {
        return identifier;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }
}
