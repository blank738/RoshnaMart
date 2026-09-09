package com.roshnamart.config;

import com.roshnamart.entity.*;
import com.roshnamart.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BuyerRepository buyerRepository;
    private final SellerRepository sellerRepository;
    private final AdminRepository adminRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final AddressRepository addressRepository;
    private final CouponRepository couponRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentRepository paymentRepository;
    private final ReviewRepository reviewRepository;
    private final MarketplaceSettingsRepository settingsRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already initialized with users. Skipping seed data.");
            return;
        }

        log.info("Initializing RoshnaMart demo & seed data...");

        // 1. Marketplace Settings
        MarketplaceSettings settings = MarketplaceSettings.builder()
                .platformName("RoshnaMart")
                .defaultCommissionPercentage(new BigDecimal("5.00"))
                .deliveryCharge(new BigDecimal("50.00"))
                .freeDeliveryThreshold(new BigDecimal("500.00"))
                .minOrderAmount(new BigDecimal("100.00"))
                .returnWindowDays(7)
                .sellerApprovalRequired(true)
                .productApprovalRequired(false)
                .codEnabled(true)
                .onlinePaymentEnabled(true)
                .build();
        settingsRepository.save(settings);

        // 2. Admin
        User adminUser = User.builder()
                .name("RoshnaMart Admin")
                .email("admin@roshnamart.com")
                .phone("9999988888")
                .password(passwordEncoder.encode("Admin@123"))
                .role(Role.ROLE_ADMIN)
                .status(UserStatus.ACTIVE)
                .build();
        adminUser = userRepository.save(adminUser);

        Admin admin = Admin.builder()
                .user(adminUser)
                .adminLevel("SUPER_ADMIN")
                .build();
        adminRepository.save(admin);

        // 3. Approved Seller 1 - Apex Electronics
        User seller1User = User.builder()
                .name("Alex Rivera")
                .email("techseller@roshnamart.com")
                .phone("9888811111")
                .password(passwordEncoder.encode("Seller@123"))
                .role(Role.ROLE_SELLER)
                .status(UserStatus.ACTIVE)
                .build();
        seller1User = userRepository.save(seller1User);

        Seller seller1 = Seller.builder()
                .user(seller1User)
                .businessName("Apex Electronics Hub")
                .businessDescription("Premier authorized vendor for premium audio gear, smart gadgets, and high-end computer accessories.")
                .businessEmail("techseller@roshnamart.com")
                .businessPhone("9888811111")
                .address("102 Silicon Valley Tech Park, Outer Ring Road")
                .city("Bangalore")
                .state("Karnataka")
                .pincode("560100")
                .verificationStatus(SellerVerificationStatus.APPROVED)
                .commissionPercentage(new BigDecimal("5.00"))
                .totalSales(15)
                .totalRevenue(new BigDecimal("34500.00"))
                .build();
        seller1 = sellerRepository.save(seller1);

        // Approved Seller 2 - Urban Vogue
        User seller2User = User.builder()
                .name("Elena Chen")
                .email("fashionseller@roshnamart.com")
                .phone("9888822222")
                .password(passwordEncoder.encode("Seller@123"))
                .role(Role.ROLE_SELLER)
                .status(UserStatus.ACTIVE)
                .build();
        seller2User = userRepository.save(seller2User);

        Seller seller2 = Seller.builder()
                .user(seller2User)
                .businessName("Urban Vogue Fashion")
                .businessDescription("Curated modern sustainable streetwear, formal wear, and luxury fashion accessories.")
                .businessEmail("fashionseller@roshnamart.com")
                .businessPhone("9888822222")
                .address("45 Fashion Street, Bandra West")
                .city("Mumbai")
                .state("Maharashtra")
                .pincode("400050")
                .verificationStatus(SellerVerificationStatus.APPROVED)
                .commissionPercentage(new BigDecimal("5.00"))
                .totalSales(22)
                .totalRevenue(new BigDecimal("28900.00"))
                .build();
        seller2 = sellerRepository.save(seller2);

        // Pending Seller - Pure Organics
        User pendingSellerUser = User.builder()
                .name("Rajesh Kumar")
                .email("newvendor@roshnamart.com")
                .phone("9888833333")
                .password(passwordEncoder.encode("Seller@123"))
                .role(Role.ROLE_SELLER)
                .status(UserStatus.ACTIVE)
                .build();
        pendingSellerUser = userRepository.save(pendingSellerUser);

        Seller pendingSeller = Seller.builder()
                .user(pendingSellerUser)
                .businessName("Pure Organics & Naturals")
                .businessDescription("Farm-fresh artisan organic groceries, cold-pressed oils, and natural herbs.")
                .businessEmail("newvendor@roshnamart.com")
                .businessPhone("9888833333")
                .address("12 Green Meadow Road")
                .city("Pune")
                .state("Maharashtra")
                .pincode("411001")
                .verificationStatus(SellerVerificationStatus.PENDING)
                .commissionPercentage(new BigDecimal("5.00"))
                .totalSales(0)
                .totalRevenue(BigDecimal.ZERO)
                .build();
        sellerRepository.save(pendingSeller);

        // 4. Buyers
        User buyerUser1 = User.builder()
                .name("John Doe")
                .email("buyer@roshnamart.com")
                .phone("9777711111")
                .password(passwordEncoder.encode("Buyer@123"))
                .role(Role.ROLE_BUYER)
                .status(UserStatus.ACTIVE)
                .build();
        buyerUser1 = userRepository.save(buyerUser1);

        Buyer buyer1 = Buyer.builder()
                .user(buyerUser1)
                .gender("Male")
                .build();
        buyer1 = buyerRepository.save(buyer1);

        Address address1 = Address.builder()
                .buyer(buyer1)
                .fullName("John Doe")
                .phone("9777711111")
                .addressLine("Flat 402, Coral Heights, Indiranagar 100ft Road")
                .city("Bangalore")
                .state("Karnataka")
                .pincode("560038")
                .country("India")
                .addressType(AddressType.HOME)
                .isDefault(true)
                .build();
        address1 = addressRepository.save(address1);

        User buyerUser2 = User.builder()
                .name("Sarah Jenkins")
                .email("buyer2@roshnamart.com")
                .phone("9777722222")
                .password(passwordEncoder.encode("Buyer@123"))
                .role(Role.ROLE_BUYER)
                .status(UserStatus.ACTIVE)
                .build();
        buyerUser2 = userRepository.save(buyerUser2);

        Buyer buyer2 = Buyer.builder()
                .user(buyerUser2)
                .gender("Female")
                .build();
        buyer2 = buyerRepository.save(buyer2);

        Address address2 = Address.builder()
                .buyer(buyer2)
                .fullName("Sarah Jenkins")
                .phone("9777722222")
                .addressLine("Villa 18, Palm Meadows, HITEC City")
                .city("Hyderabad")
                .state("Telangana")
                .pincode("500081")
                .country("India")
                .addressType(AddressType.WORK)
                .isDefault(true)
                .build();
        addressRepository.save(address2);

        // 5. Categories
        Category catElectronics = categoryRepository.save(Category.builder()
                .name("Electronics")
                .description("Smartphones, premium headphones, laptops, and smart wearables")
                .image("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80")
                .status("ACTIVE")
                .build());

        Category catFashion = categoryRepository.save(Category.builder()
                .name("Fashion & Apparel")
                .description("Trendy apparel, stylish jackets, luxury watches, and leather goods")
                .image("https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&auto=format&fit=crop&q=80")
                .status("ACTIVE")
                .build());

        Category catHome = categoryRepository.save(Category.builder()
                .name("Home & Kitchen")
                .description("Modern home decor, kitchen appliances, and ergonomic furniture")
                .image("https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80")
                .status("ACTIVE")
                .build());

        Category catBeauty = categoryRepository.save(Category.builder()
                .name("Beauty & Personal Care")
                .description("Organic skincare, luxury perfumes, and personal grooming essentials")
                .image("https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80")
                .status("ACTIVE")
                .build());

        Category catSports = categoryRepository.save(Category.builder()
                .name("Sports & Fitness")
                .description("Workout equipment, activewear, running shoes, and smart fitness bands")
                .image("https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80")
                .status("ACTIVE")
                .build());

        // 6. Products
        Product p1 = productRepository.save(Product.builder()
                .seller(seller1)
                .category(catElectronics)
                .name("Apex SoundPro Active Noise Cancelling Headphones")
                .description("Experience studio-grade acoustics with hybrid 40mm drivers, active noise cancellation up to 45dB, and ultra-long 60-hour battery life. Ultra-soft protein leather ear cushions.")
                .price(new BigDecimal("4999.00"))
                .discountPrice(new BigDecimal("3999.00"))
                .quantity(35)
                .imageUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80")
                .brand("SoundPro")
                .sku("SKU-SP-001")
                .status(ProductStatus.ACTIVE)
                .rating(4.8)
                .reviewCount(1)
                .build());

        Product p2 = productRepository.save(Product.builder()
                .seller(seller1)
                .category(catElectronics)
                .name("Apex UltraPulse AMOLED Smartwatch")
                .description("Premium titanium bezel with 1.43-inch Always-on AMOLED display. Features real-time heart rate monitoring, SpO2 sensor, sleep tracker, and 120+ sport modes.")
                .price(new BigDecimal("3499.00"))
                .discountPrice(new BigDecimal("2799.00"))
                .quantity(40)
                .imageUrl("https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80")
                .brand("PulseTech")
                .sku("SKU-SW-002")
                .status(ProductStatus.ACTIVE)
                .rating(4.6)
                .reviewCount(0)
                .build());

        Product p3 = productRepository.save(Product.builder()
                .seller(seller1)
                .category(catElectronics)
                .name("Apex Ergonomic Wireless Mechanical Keyboard")
                .description("Custom tactile brown switches, multi-device Bluetooth 5.2 and 2.4GHz wireless connectivity, south-facing RGB backlighting with anodized aluminum body.")
                .price(new BigDecimal("5999.00"))
                .discountPrice(new BigDecimal("4999.00"))
                .quantity(20)
                .imageUrl("https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80")
                .brand("ApexTech")
                .sku("SKU-KB-003")
                .status(ProductStatus.ACTIVE)
                .rating(4.9)
                .reviewCount(0)
                .build());

        Product p4 = productRepository.save(Product.builder()
                .seller(seller1)
                .category(catElectronics)
                .name("Apex TrueBass Waterproof Bluetooth Speaker")
                .description("IPX7 fully submersible waterproof outdoor speaker with 360-degree surround sound, dual passive radiators, and 24-hour non-stop playtime.")
                .price(new BigDecimal("2499.00"))
                .discountPrice(new BigDecimal("1899.00"))
                .quantity(50)
                .imageUrl("https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&auto=format&fit=crop&q=80")
                .brand("TrueBass")
                .sku("SKU-SPK-004")
                .status(ProductStatus.ACTIVE)
                .rating(4.5)
                .reviewCount(0)
                .build());

        Product p5 = productRepository.save(Product.builder()
                .seller(seller2)
                .category(catFashion)
                .name("Urban Vogue Vintage Washed Denim Jacket")
                .description("Classic tailored silhouette constructed from 100% heavyweight organic cotton denim. Features antique brass hardware, deep inner utility pockets, and reinforced stitching.")
                .price(new BigDecimal("2999.00"))
                .discountPrice(new BigDecimal("2299.00"))
                .quantity(25)
                .imageUrl("https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80")
                .brand("UrbanVogue")
                .sku("SKU-DNM-101")
                .status(ProductStatus.ACTIVE)
                .rating(4.7)
                .reviewCount(0)
                .build());

        Product p6 = productRepository.save(Product.builder()
                .seller(seller2)
                .category(catFashion)
                .name("Urban Vogue Top-Grain Leather Weekend Duffel Bag")
                .description("Handcrafted from premium full-grain distress leather with YKK metal zippers, water-resistant interior lining, and a dedicated padded shoe compartment.")
                .price(new BigDecimal("6499.00"))
                .discountPrice(new BigDecimal("4999.00"))
                .quantity(15)
                .imageUrl("https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80")
                .brand("UrbanVogue")
                .sku("SKU-BAG-102")
                .status(ProductStatus.ACTIVE)
                .rating(4.9)
                .reviewCount(0)
                .build());

        Product p7 = productRepository.save(Product.builder()
                .seller(seller2)
                .category(catFashion)
                .name("Urban Minimalist Polarized Sunglasses")
                .description("Ultra-lightweight handmade acetate frames with UV400 polarized scratch-resistant lenses. Provides glare reduction with stylish minimalist aesthetics.")
                .price(new BigDecimal("1999.00"))
                .discountPrice(new BigDecimal("1499.00"))
                .quantity(30)
                .imageUrl("https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80")
                .brand("VogueOptics")
                .sku("SKU-SGL-103")
                .status(ProductStatus.ACTIVE)
                .rating(4.4)
                .reviewCount(0)
                .build());

        Product p8 = productRepository.save(Product.builder()
                .seller(seller2)
                .category(catFashion)
                .name("Urban Luxe Chronograph Stainless Steel Watch")
                .description("Precision Japanese quartz movement with sapphire crystal glass, 50m water resistance, and polished surgical grade 316L stainless steel strap.")
                .price(new BigDecimal("5499.00"))
                .discountPrice(new BigDecimal("4299.00"))
                .quantity(18)
                .imageUrl("https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80")
                .brand("LuxeTime")
                .sku("SKU-WTC-104")
                .status(ProductStatus.ACTIVE)
                .rating(4.8)
                .reviewCount(0)
                .build());

        Product p9 = productRepository.save(Product.builder()
                .seller(seller1)
                .category(catHome)
                .name("Apex Barista Precision Pour-Over Coffee Maker")
                .description("Borosilicate heat-resistant glass carafe with double-mesh stainless steel reusable filter. Produces aromatic, sediment-free pour-over coffee.")
                .price(new BigDecimal("1899.00"))
                .discountPrice(new BigDecimal("1499.00"))
                .quantity(22)
                .imageUrl("https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&auto=format&fit=crop&q=80")
                .brand("BaristaPro")
                .sku("SKU-COF-201")
                .status(ProductStatus.ACTIVE)
                .rating(4.6)
                .reviewCount(0)
                .build());

        Product p10 = productRepository.save(Product.builder()
                .seller(seller2)
                .category(catHome)
                .name("Artisan Ceramic Handcrafted Dinner Set (16 Pcs)")
                .description("Microwave and dishwasher safe stoneware pottery with natural reactive glaze finish. Includes dinner plates, side plates, soup bowls, and mugs.")
                .price(new BigDecimal("3999.00"))
                .discountPrice(new BigDecimal("3199.00"))
                .quantity(12)
                .imageUrl("https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&auto=format&fit=crop&q=80")
                .brand("EarthCraft")
                .sku("SKU-DIN-202")
                .status(ProductStatus.ACTIVE)
                .rating(4.7)
                .reviewCount(0)
                .build());

        Product p11 = productRepository.save(Product.builder()
                .seller(seller2)
                .category(catBeauty)
                .name("Botanical Glow Organic Vitamin C Serum")
                .description("Formulated with 20% stabilized Vitamin C, botanical hyaluronic acid, and ferulic acid to brighten skin tone, fade dark spots, and boost collagen.")
                .price(new BigDecimal("1299.00"))
                .discountPrice(new BigDecimal("899.00"))
                .quantity(60)
                .imageUrl("https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80")
                .brand("BotanicalGlow")
                .sku("SKU-SRM-301")
                .status(ProductStatus.ACTIVE)
                .rating(4.8)
                .reviewCount(0)
                .build());

        Product p12 = productRepository.save(Product.builder()
                .seller(seller1)
                .category(catSports)
                .name("ProGrip Non-Slip Eco Yoga Mat (6mm)")
                .description("Biodegradable TPE material with dual-sided textured grip, alignment guidelines, and carrying strap included. Free from PVC and toxic chemicals.")
                .price(new BigDecimal("1499.00"))
                .discountPrice(new BigDecimal("1099.00"))
                .quantity(45)
                .imageUrl("https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&auto=format&fit=crop&q=80")
                .brand("ProGrip")
                .sku("SKU-YOG-401")
                .status(ProductStatus.ACTIVE)
                .rating(4.5)
                .reviewCount(0)
                .build());

        // 7. Coupons
        couponRepository.save(Coupon.builder()
                .code("WELCOME10")
                .discountType(DiscountType.PERCENTAGE)
                .discountValue(new BigDecimal("10.00"))
                .minimumOrderAmount(new BigDecimal("500.00"))
                .maximumDiscount(new BigDecimal("200.00"))
                .startDate(LocalDate.now().minusDays(10))
                .expiryDate(LocalDate.now().plusMonths(3))
                .usageLimit(1000)
                .usedCount(12)
                .status("ACTIVE")
                .build());

        couponRepository.save(Coupon.builder()
                .code("ROSHNA20")
                .discountType(DiscountType.PERCENTAGE)
                .discountValue(new BigDecimal("20.00"))
                .minimumOrderAmount(new BigDecimal("1500.00"))
                .maximumDiscount(new BigDecimal("500.00"))
                .startDate(LocalDate.now().minusDays(5))
                .expiryDate(LocalDate.now().plusMonths(2))
                .usageLimit(500)
                .usedCount(34)
                .status("ACTIVE")
                .build());

        couponRepository.save(Coupon.builder()
                .code("SAVE50")
                .discountType(DiscountType.FIXED_AMOUNT)
                .discountValue(new BigDecimal("50.00"))
                .minimumOrderAmount(new BigDecimal("300.00"))
                .startDate(LocalDate.now().minusDays(5))
                .expiryDate(LocalDate.now().plusMonths(6))
                .usageLimit(2000)
                .usedCount(5)
                .status("ACTIVE")
                .build());

        // 8. Completed Sample Multi-Vendor Order (Order with Seller 1 and Seller 2 products)
        Order sampleOrder = Order.builder()
                .buyer(buyer1)
                .orderNumber("ORD-20260908120000-7821")
                .totalAmount(new BigDecimal("6298.00"))
                .discountAmount(new BigDecimal("200.00"))
                .deliveryCharge(BigDecimal.ZERO)
                .finalAmount(new BigDecimal("6098.00"))
                .paymentStatus(PaymentStatus.SUCCESS)
                .orderStatus(OrderStatus.DELIVERED)
                .shippingAddress(address1)
                .build();
        sampleOrder = orderRepository.save(sampleOrder);

        // Order Item 1: Headphones from Seller 1 (Apex Electronics)
        OrderItem item1 = OrderItem.builder()
                .order(sampleOrder)
                .product(p1)
                .seller(seller1)
                .productName(p1.getName())
                .quantity(1)
                .unitPrice(p1.getDiscountPrice())
                .subtotal(p1.getDiscountPrice())
                .commissionAmount(new BigDecimal("199.95"))
                .sellerEarning(new BigDecimal("3799.05"))
                .itemStatus(OrderItemStatus.DELIVERED)
                .build();
        orderItemRepository.save(item1);

        // Order Item 2: Denim Jacket from Seller 2 (Urban Vogue)
        OrderItem item2 = OrderItem.builder()
                .order(sampleOrder)
                .product(p5)
                .seller(seller2)
                .productName(p5.getName())
                .quantity(1)
                .unitPrice(p5.getDiscountPrice())
                .subtotal(p5.getDiscountPrice())
                .commissionAmount(new BigDecimal("114.95"))
                .sellerEarning(new BigDecimal("2184.05"))
                .itemStatus(OrderItemStatus.DELIVERED)
                .build();
        orderItemRepository.save(item2);

        Payment payment = Payment.builder()
                .order(sampleOrder)
                .paymentMethod(PaymentMethod.ONLINE)
                .transactionId("TXN-DEMO-9988776655")
                .amount(new BigDecimal("6098.00"))
                .paymentStatus(PaymentStatus.SUCCESS)
                .paymentDate(LocalDateTime.now().minusDays(2))
                .build();
        paymentRepository.save(payment);
        sampleOrder.setPayment(payment);

        // Sample Review from Buyer 1 for Product 1 (Headphones)
        Review review = Review.builder()
                .product(p1)
                .buyer(buyer1)
                .rating(5)
                .title("Incredible Soundstage and Noise Cancellation!")
                .comment("I've been testing these headphones for a couple of days now. The ANC completely blocks out room noise, and the bass response is clean and tight. Definitely worth the price!")
                .build();
        reviewRepository.save(review);

        log.info("RoshnaMart seed data created successfully!");
    }
}
