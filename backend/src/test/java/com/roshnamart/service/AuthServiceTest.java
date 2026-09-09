package com.roshnamart.service;

import com.roshnamart.dto.AuthResponse;
import com.roshnamart.dto.BuyerRegisterRequest;
import com.roshnamart.dto.LoginRequest;
import com.roshnamart.entity.Buyer;
import com.roshnamart.entity.Role;
import com.roshnamart.entity.User;
import com.roshnamart.entity.UserStatus;
import com.roshnamart.exception.DuplicateResourceException;
import com.roshnamart.exception.UnauthorizedException;
import com.roshnamart.repository.*;
import com.roshnamart.security.JwtTokenProvider;
import com.roshnamart.security.UserPrincipal;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private BuyerRepository buyerRepository;
    @Mock
    private SellerRepository sellerRepository;
    @Mock
    private AdminRepository adminRepository;
    @Mock
    private MarketplaceSettingsRepository settingsRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthService authService;

    @Test
    @DisplayName("Buyer Registration: Successfully saves user, buyer entity, and returns JWT")
    void testRegisterBuyerSuccess() {
        BuyerRegisterRequest request = BuyerRegisterRequest.builder()
                .name("Jane Buyer")
                .email("jane@roshnamart.com")
                .phone("9876543210")
                .password("Password@123")
                .confirmPassword("Password@123")
                .build();

        when(userRepository.existsByEmail("jane@roshnamart.com")).thenReturn(false);
        when(passwordEncoder.encode("Password@123")).thenReturn("hashed_password");

        User savedUser = User.builder()
                .id(101L)
                .name("Jane Buyer")
                .email("jane@roshnamart.com")
                .phone("9876543210")
                .password("hashed_password")
                .role(Role.ROLE_BUYER)
                .status(UserStatus.ACTIVE)
                .build();
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(buyerRepository.save(any(Buyer.class))).thenAnswer(i -> i.getArgument(0));

        // Mock authentication
        UserPrincipal principal = UserPrincipal.create(savedUser);
        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(principal);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(tokenProvider.generateToken(auth)).thenReturn("mock.jwt.token");
        when(userRepository.findById(101L)).thenReturn(Optional.of(savedUser));

        AuthResponse response = authService.registerBuyer(request);

        assertNotNull(response);
        assertEquals("mock.jwt.token", response.getToken());
        assertEquals("jane@roshnamart.com", response.getEmail());
        assertEquals("ROLE_BUYER", response.getRole());
        verify(userRepository, times(2)).save(any(User.class));
        verify(buyerRepository).save(any(Buyer.class));
    }

    @Test
    @DisplayName("Buyer Registration: Rejects mismatched passwords")
    void testRegisterBuyerMismatchedPasswords() {
        BuyerRegisterRequest request = BuyerRegisterRequest.builder()
                .name("Jane Buyer")
                .email("jane@roshnamart.com")
                .password("Password@123")
                .confirmPassword("WrongPassword")
                .build();

        assertThrows(IllegalArgumentException.class, () -> authService.registerBuyer(request));
        verifyNoInteractions(userRepository);
    }

    @Test
    @DisplayName("Buyer Registration: Rejects duplicate email")
    void testRegisterBuyerDuplicateEmail() {
        BuyerRegisterRequest request = BuyerRegisterRequest.builder()
                .name("Jane Buyer")
                .email("existing@roshnamart.com")
                .password("Password@123")
                .confirmPassword("Password@123")
                .build();

        when(userRepository.existsByEmail("existing@roshnamart.com")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> authService.registerBuyer(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Login: Throws UnauthorizedException on bad credentials")
    void testLoginBadCredentials() {
        LoginRequest request = LoginRequest.builder()
                .email("user@roshnamart.com")
                .password("wrongpassword")
                .build();

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new org.springframework.security.authentication.BadCredentialsException("Bad credentials"));

        assertThrows(UnauthorizedException.class, () -> authService.login(request));
    }
}
