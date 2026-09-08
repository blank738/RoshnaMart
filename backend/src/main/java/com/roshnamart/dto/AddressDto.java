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
    @NotBlank(message = "Full name is required")
    private String fullName;
    @NotBlank(message = "Phone number is required")
    private String phone;
    @NotBlank(message = "Address line is required")
    private String addressLine;
    @NotBlank(message = "City is required")
    private String city;
    @NotBlank(message = "State is required")
    private String state;
    @NotBlank(message = "Pincode is required")
    private String pincode;
    private String country;
    private AddressType addressType;
    private Boolean isDefault;
}
