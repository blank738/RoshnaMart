package com.roshnamart.service;

import com.roshnamart.dto.AddressDto;
import com.roshnamart.entity.Address;
import com.roshnamart.entity.AddressType;
import com.roshnamart.entity.Buyer;
import com.roshnamart.exception.ForbiddenException;
import com.roshnamart.exception.ResourceNotFoundException;
import com.roshnamart.mapper.EntityDtoMapper;
import com.roshnamart.repository.AddressRepository;
import com.roshnamart.repository.BuyerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;
    private final BuyerRepository buyerRepository;
    private final EntityDtoMapper mapper;

    @Transactional(readOnly = true)
    public List<AddressDto> getBuyerAddresses(Long buyerUserId) {
        Buyer buyer = buyerRepository.findByUserId(buyerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer profile not found"));

        return addressRepository.findByBuyerId(buyer.getId()).stream()
                .map(mapper::toAddressDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AddressDto addAddress(Long buyerUserId, AddressDto dto) {
        Buyer buyer = buyerRepository.findByUserId(buyerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer profile not found"));

        List<Address> existing = addressRepository.findByBuyerId(buyer.getId());
        boolean shouldBeDefault = existing.isEmpty() || Boolean.TRUE.equals(dto.getIsDefault());

        if (shouldBeDefault && !existing.isEmpty()) {
            for (Address a : existing) {
                if (Boolean.TRUE.equals(a.getIsDefault())) {
                    a.setIsDefault(false);
                    addressRepository.save(a);
                }
            }
        }

        Address address = Address.builder()
                .buyer(buyer)
                .fullName(dto.getFullName())
                .phone(dto.getPhone())
                .addressLine(dto.getAddressLine())
                .city(dto.getCity())
                .state(dto.getState())
                .pincode(dto.getPincode())
                .country(dto.getCountry() != null ? dto.getCountry() : "India")
                .addressType(dto.getAddressType() != null ? dto.getAddressType() : AddressType.HOME)
                .isDefault(shouldBeDefault)
                .build();

        Address saved = addressRepository.save(address);
        return mapper.toAddressDto(saved);
    }

    @Transactional
    public AddressDto updateAddress(Long buyerUserId, Long addressId, AddressDto dto) {
        Buyer buyer = buyerRepository.findByUserId(buyerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer profile not found"));

        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + addressId));

        if (!address.getBuyer().getId().equals(buyer.getId())) {
            throw new ForbiddenException("Unauthorized to modify this address");
        }

        if (Boolean.TRUE.equals(dto.getIsDefault())) {
            List<Address> existing = addressRepository.findByBuyerId(buyer.getId());
            for (Address a : existing) {
                if (!a.getId().equals(addressId) && Boolean.TRUE.equals(a.getIsDefault())) {
                    a.setIsDefault(false);
                    addressRepository.save(a);
                }
            }
            address.setIsDefault(true);
        }

        address.setFullName(dto.getFullName());
        address.setPhone(dto.getPhone());
        address.setAddressLine(dto.getAddressLine());
        address.setCity(dto.getCity());
        address.setState(dto.getState());
        address.setPincode(dto.getPincode());
        if (dto.getCountry() != null) address.setCountry(dto.getCountry());
        if (dto.getAddressType() != null) address.setAddressType(dto.getAddressType());

        Address saved = addressRepository.save(address);
        return mapper.toAddressDto(saved);
    }

    @Transactional
    public void deleteAddress(Long buyerUserId, Long addressId) {
        Buyer buyer = buyerRepository.findByUserId(buyerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer profile not found"));

        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + addressId));

        if (!address.getBuyer().getId().equals(buyer.getId())) {
            throw new ForbiddenException("Unauthorized to delete this address");
        }

        addressRepository.delete(address);
    }

    @Transactional
    public void setDefaultAddress(Long buyerUserId, Long addressId) {
        Buyer buyer = buyerRepository.findByUserId(buyerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer profile not found"));

        List<Address> existing = addressRepository.findByBuyerId(buyer.getId());
        for (Address a : existing) {
            if (a.getId().equals(addressId)) {
                a.setIsDefault(true);
            } else {
                a.setIsDefault(false);
            }
            addressRepository.save(a);
        }
    }
}
