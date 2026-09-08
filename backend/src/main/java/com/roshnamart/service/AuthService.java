package com.roshnamart.service;

import com.roshnamart.dto.*;
import com.roshnamart.entity.*;
import com.roshnamart.exception.DuplicateResourceException;
import com.roshnamart.exception.ResourceNotFoundException;
import com.roshnamart.exception.UnauthorizedException;
import com.roshnamart.repository.*;
import com.roshnamart.security.JwtTokenProvider;
import com.roshnamart.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final BuyerRepository buyerRepository;
    private final SellerRepository sellerRepository;
    private final AdminRepository adminRepository;
    private final MarketplaceSettingsRepository settingsRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse registerBuyer(BuyerRegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email is already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail().toLowerCase().trim())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.ROLE_BUYER)
                .status(UserStatus.ACTIVE)
                .build();

        User savedUser = userRepository.save(user);

        Buyer buyer = Buyer.builder()
                .user(savedUser)
                .build();
        buyerRepository.save(buyer);

        return authenticateAndGenerateToken(request.getEmail(), request.getPassword());
    }

    @Transactional
    public AuthResponse registerSeller(SellerRegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email is already registered");
        }

        MarketplaceSettings settings = settingsRepository.findFirstByOrderByIdAsc()
                .orElse(MarketplaceSettings.builder().build());

        SellerVerificationStatus initialStatus = Boolean.TRUE.equals(settings.getSellerApprovalRequired()) ?
                SellerVerificationStatus.PENDING : SellerVerificationStatus.APPROVED;

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail().toLowerCase().trim())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.ROLE_SELLER)
                .status(UserStatus.ACTIVE)
                .build();

        User savedUser = userRepository.save(user);

        Seller seller = Seller.builder()
                .user(savedUser)
                .businessName(request.getBusinessName())
                .businessDescription(request.getBusinessDescription())
                .businessEmail(request.getBusinessEmail() != null ? request.getBusinessEmail() : request.getEmail())
                .businessPhone(request.getBusinessPhone() != null ? request.getBusinessPhone() : request.getPhone())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .pincode(request.getPincode())
                .verificationStatus(initialStatus)
                .commissionPercentage(settings.getDefaultCommissionPercentage() != null ? settings.getDefaultCommissionPercentage() : new BigDecimal("5.00"))
                .build();
        sellerRepository.save(seller);

        return authenticateAndGenerateToken(request.getEmail(), request.getPassword());
    }

    public AuthResponse login(LoginRequest request) {
        return authenticateAndGenerateToken(request.getEmail().toLowerCase().trim(), request.getPassword());
    }

    private AuthResponse authenticateAndGenerateToken(String email, String password) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password)
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = tokenProvider.generateToken(authentication);
            UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

            User user = userRepository.findById(principal.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);

            String sellerStatus = null;
            if (user.getRole() == Role.ROLE_SELLER) {
                sellerStatus = sellerRepository.findByUserId(user.getId())
                        .map(s -> s.getVerificationStatus().name())
                        .orElse(null);
            }

            return AuthResponse.builder()
                    .token(jwt)
                    .id(user.getId())
                    .name(user.getName())
                    .email(user.getEmail())
                    .role(user.getRole().name())
                    .status(user.getStatus().name())
                    .sellerVerificationStatus(sellerStatus)
                    .build();
        } catch (Exception ex) {
            throw new UnauthorizedException("Invalid email or password");
        }
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        UserProfileResponse.UserProfileResponseBuilder builder = UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .status(user.getStatus().name())
                .createdAt(user.getCreatedAt());

        if (user.getRole() == Role.ROLE_BUYER) {
            buyerRepository.findByUserId(user.getId()).ifPresent(buyer -> {
                builder.buyerId(buyer.getId())
                        .dateOfBirth(buyer.getDateOfBirth())
                        .gender(buyer.getGender())
                        .profileImage(buyer.getProfileImage());
            });
        } else if (user.getRole() == Role.ROLE_SELLER) {
            sellerRepository.findByUserId(user.getId()).ifPresent(seller -> {
                builder.sellerId(seller.getId())
                        .businessName(seller.getBusinessName())
                        .businessDescription(seller.getBusinessDescription())
                        .businessEmail(seller.getBusinessEmail())
                        .businessPhone(seller.getBusinessPhone())
                        .address(seller.getAddress())
                        .city(seller.getCity())
                        .state(seller.getState())
                        .pincode(seller.getPincode())
                        .verificationStatus(seller.getVerificationStatus().name())
                        .commissionPercentage(seller.getCommissionPercentage())
                        .totalSales(seller.getTotalSales())
                        .totalRevenue(seller.getTotalRevenue());
            });
        }

        return builder.build();
    }
}
