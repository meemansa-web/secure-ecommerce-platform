package com.ecommerce.service;

import com.ecommerce.dto.request.AddressRequest;
import com.ecommerce.dto.response.AddressResponse;
import com.ecommerce.dto.response.MessageResponse;
import com.ecommerce.entity.Address;
import com.ecommerce.entity.User;
import com.ecommerce.exception.UserNotFoundException;
import com.ecommerce.repository.AddressRepository;
import com.ecommerce.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public AddressServiceImpl(
            AddressRepository addressRepository,
            UserRepository userRepository
    ) {
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
    }

    @Override
    public AddressResponse addAddress(
            String email,
            AddressRequest request
    ) {

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException("Customer not found")
                );

        Address address = new Address();

        address.setFullName(request.getFullName().trim());
        address.setPhone(request.getPhone().trim());
        address.setAddressLine1(request.getAddressLine1().trim());
        address.setAddressLine2(request.getAddressLine2());
        address.setCity(request.getCity().trim());
        address.setState(request.getState().trim());
        address.setPincode(request.getPincode().trim());
        address.setCountry(request.getCountry().trim());

        address.setUser(user);

        Address savedAddress =
                addressRepository.save(address);

        return mapToResponse(savedAddress);
    }

    @Override
    public List<AddressResponse> getAddresses(
            String email
    ) {

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException("Customer not found")
                );

        return addressRepository
                .findByUserId(user.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public MessageResponse deleteAddress(
            String email,
            Long addressId
    ) {

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException("Customer not found")
                );

        Address address = addressRepository
                .findById(addressId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Address not found"
                        )
                );

        if (!address.getUser()
                .getId()
                .equals(user.getId())) {

            throw new IllegalArgumentException(
                    "You cannot delete this address"
            );
        }

        addressRepository.delete(address);

        return new MessageResponse(
                "Address deleted successfully"
        );
    }

    private AddressResponse mapToResponse(Address address) {

        return new AddressResponse(
                address.getId(),
                address.getFullName(),
                address.getPhone(),
                address.getAddressLine1(),
                address.getAddressLine2(),
                address.getCity(),
                address.getState(),
                address.getPincode(),
                address.getCountry(),
                address.isDefaultAddress()
        );
    }
    
    @Override
    public AddressResponse updateAddress(
            String email,
            Long addressId,
            AddressRequest request
    ) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException("Customer not found")
                );

        Address address = addressRepository.findById(addressId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Address not found")
                );

        // Security check
        if (!address.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException(
                    "You cannot update this address"
            );
        }

        address.setFullName(request.getFullName().trim());
        address.setPhone(request.getPhone().trim());
        address.setAddressLine1(request.getAddressLine1().trim());
        address.setAddressLine2(request.getAddressLine2());
        address.setCity(request.getCity().trim());
        address.setState(request.getState().trim());
        address.setPincode(request.getPincode().trim());
        address.setCountry(request.getCountry().trim());

        Address updatedAddress =
                addressRepository.save(address);

        return mapToResponse(updatedAddress);
    }
}