package com.roshnamart.dto;

import com.roshnamart.entity.AddressType;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressDto {
    private Long id;
    private String fullName;
    private String phone;
    private String addressLine;
    private String streetAddress;
    @NotBlank(message = "City is required")
    private String city;
    @NotBlank(message = "State is required")
    private String state;
    @NotBlank(message = "Pincode is required")
    private String pincode;
    private String country;
    private AddressType addressType;
    private Boolean isDefault;

    public void setStreetAddress(String streetAddress) {
        this.streetAddress = streetAddress;
        if (this.addressLine == null || this.addressLine.isBlank()) {
            this.addressLine = streetAddress;
        }
    }

    public void setAddressLine(String addressLine) {
        this.addressLine = addressLine;
        if (this.streetAddress == null || this.streetAddress.isBlank()) {
            this.streetAddress = addressLine;
        }
    }

    public String getAddressLine() {
        return addressLine != null && !addressLine.isBlank() ? addressLine : streetAddress;
    }

    public String getStreetAddress() {
        return streetAddress != null && !streetAddress.isBlank() ? streetAddress : addressLine;
    }
}
