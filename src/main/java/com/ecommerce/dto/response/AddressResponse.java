package com.ecommerce.dto.response;

public class AddressResponse {

    private Long id;
    private String fullName;
    private String phone;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String pincode;
    private String country;
    private boolean defaultAddress;

    public AddressResponse() {
    }

    public AddressResponse(Long id, String fullName, String phone, String addressLine1, String addressLine2,
			String city, String state, String pincode, String country, boolean defaultAddress) {
		super();
		this.id = id;
		this.fullName = fullName;
		this.phone = phone;
		this.addressLine1 = addressLine1;
		this.addressLine2 = addressLine2;
		this.city = city;
		this.state = state;
		this.pincode = pincode;
		this.country = country;
		this.defaultAddress = defaultAddress;
	}

	public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getPhone() {
        return phone;
    }

    public String getAddressLine1() {
        return addressLine1;
    }

    public String getAddressLine2() {
        return addressLine2;
    }

    public String getCity() {
        return city;
    }

    public String getState() {
        return state;
    }

    public String getPincode() {
        return pincode;
    }

    public String getCountry() {
        return country;
    }

	public boolean isDefaultAddress() {
		return defaultAddress;
	}

	public void setDefaultAddress(boolean defaultAddress) {
		this.defaultAddress = defaultAddress;
	}
    
}