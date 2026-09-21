package com.roshnamart.service;

import com.roshnamart.dto.OrderItemResponse;
import com.roshnamart.dto.OrderResponse;
import com.roshnamart.entity.*;
import com.roshnamart.mapper.EntityDtoMapper;
import com.roshnamart.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class OrderStatusSyncTest {

    @Mock
    private SellerRepository sellerRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private OrderItemRepository orderItemRepository;
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private NotificationService notificationService;
    @Mock
    private EntityDtoMapper mapper;

    @InjectMocks
    private SellerService sellerService;

    @Mock
    private UserRepository userRepository;
    @Mock
    private ReturnRequestRepository returnRequestRepository;
    @Mock
    private MarketplaceSettingsRepository settingsRepository;
    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private AdminService adminService;

    private User sellerUser;
    private Seller seller;
    private User buyerUser;
    private Buyer buyer;
    private Order order;
    private OrderItem item;

    @BeforeEach
    void setUp() {
        sellerUser = User.builder().id(10L).email("seller@test.com").name("Seller User").build();
        seller = Seller.builder().id(1L).user(sellerUser).build();

        buyerUser = User.builder().id(20L).email("buyer@test.com").name("Buyer User").build();
        buyer = Buyer.builder().id(2L).user(buyerUser).build();

        order = Order.builder()
                .id(100L)
                .orderNumber("ORD-TEST-100")
                .buyer(buyer)
                .orderStatus(OrderStatus.PLACED)
                .totalAmount(new BigDecimal("1000.00"))
                .finalAmount(new BigDecimal("1000.00"))
                .createdAt(LocalDateTime.now().minusHours(2))
                .build();

        item = OrderItem.builder()
                .id(200L)
                .order(order)
                .seller(seller)
                .productName("Test Product")
                .quantity(1)
                .unitPrice(new BigDecimal("1000.00"))
                .subtotal(new BigDecimal("1000.00"))
                .itemStatus(OrderItemStatus.PLACED)
                .build();
    }

    @Test
    @DisplayName("Seller updating item status to DELIVERED updates parent Order status to DELIVERED")
    void testSellerUpdateItemStatusToDeliveredSyncsParentOrder() {
        when(sellerRepository.findByUserId(10L)).thenReturn(Optional.of(seller));
        when(orderItemRepository.findById(200L)).thenReturn(Optional.of(item));
        when(orderItemRepository.save(any(OrderItem.class))).thenAnswer(inv -> inv.getArgument(0));
        when(orderItemRepository.findByOrderId(100L)).thenReturn(List.of(item));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
        when(mapper.toOrderItemResponse(any(OrderItem.class))).thenReturn(
                OrderItemResponse.builder().id(200L).itemStatus("DELIVERED").build()
        );

        OrderItemResponse response = sellerService.updateOrderItemStatus(10L, 200L, OrderItemStatus.DELIVERED);

        assertNotNull(response);
        assertEquals("DELIVERED", response.getItemStatus());
        assertEquals(OrderItemStatus.DELIVERED, item.getItemStatus());
        // Verify parent order status is updated to DELIVERED
        assertEquals(OrderStatus.DELIVERED, order.getOrderStatus());
        assertNotNull(order.getUpdatedAt());
        verify(orderRepository, times(1)).save(order);
    }

    @Test
    @DisplayName("Admin updating order status to DELIVERED synchronizes items to DELIVERED")
    void testAdminUpdateOrderStatusToDeliveredSyncsItems() {
        User adminUser = User.builder().id(99L).email("admin@test.com").name("Admin").build();
        order.setItems(List.of(item));

        when(orderRepository.findById(100L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
        when(orderItemRepository.findByOrderId(100L)).thenReturn(List.of(item));
        when(orderItemRepository.save(any(OrderItem.class))).thenAnswer(inv -> inv.getArgument(0));
        when(mapper.toOrderResponse(any(Order.class))).thenReturn(
                OrderResponse.builder().id(100L).orderStatus("DELIVERED").build()
        );

        OrderResponse response = adminService.updateOrderStatus(100L, OrderStatus.DELIVERED, adminUser);

        assertNotNull(response);
        assertEquals("DELIVERED", response.getOrderStatus());
        assertEquals(OrderStatus.DELIVERED, order.getOrderStatus());
        assertEquals(OrderItemStatus.DELIVERED, item.getItemStatus());
        assertNotNull(order.getUpdatedAt());
        verify(orderRepository, times(1)).save(order);
        verify(orderItemRepository, times(1)).save(item);
    }
}
