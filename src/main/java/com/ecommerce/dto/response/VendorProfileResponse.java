package com.ecommerce.dto.response;

public class VendorProfileResponse {

    private Long vendorId;
    private Long userId;

    private String firstName;
    private String lastName;
    private String username;
    private String email;

    private String businessName;
    private String businessEmail;
    private String businessPhone;
    private String businessAddress;

    private String status;

    public VendorProfileResponse() {
    }

    public VendorProfileResponse(
            Long vendorId,
            Long userId,
            String firstName,
            String lastName,
            String username,
            String email,
            String businessName,
            String businessEmail,
            String businessPhone,
            String businessAddress,
            String status
    ) {
        this.vendorId = vendorId;
        this.userId = userId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.username = username;
        this.email = email;
        this.businessName = businessName;
        this.businessEmail = businessEmail;
        this.businessPhone = businessPhone;
        this.businessAddress = businessAddress;
        this.status = status;
    }

    public Long getVendorId() {
        return vendorId;
    }

    public Long getUserId() {
        return userId;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
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

    public String getBusinessEmail() {
        return businessEmail;
    }

    public String getBusinessPhone() {
        return businessPhone;
    }

    public String getBusinessAddress() {
        return businessAddress;
    }

    public String getStatus() {
        return status;
    }
}