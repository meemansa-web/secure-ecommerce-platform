package com.ecommerce.dto.response;

public class VendorRegistrationResponse {

    private Long vendorId;
    private Long userId;
    private String username;
    private String email;
    private String businessName;
    private String status;
    private String message;

    public VendorRegistrationResponse() {
    }

    public VendorRegistrationResponse(
            Long vendorId,
            Long userId,
            String username,
            String email,
            String businessName,
            String status,
            String message
    ) {
        this.vendorId = vendorId;
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.businessName = businessName;
        this.status = status;
        this.message = message;
    }

    public Long getVendorId() {
        return vendorId;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getBusinessName() {
        return businessName;
    }

    public String getStatus() {
        return status;
    }

    public String getMessage() {
        return message;
    }
}
