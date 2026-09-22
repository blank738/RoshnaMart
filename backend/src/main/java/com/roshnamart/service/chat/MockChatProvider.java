package com.roshnamart.service.chat;

import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.regex.Pattern;

/**
 * MockChatProvider provides canned FAQ domain responses without making any network calls.
 * Used for development, testing, and offline deployments.
 */
@Component
public class MockChatProvider implements ChatProvider {

    private static final Pattern PAYMENT_PATTERN = Pattern.compile("\\b(payment|payments|pay|upi|card|cards|netbanking|wallet|cod|cash on delivery)\\b");
    private static final Pattern GREETING_PATTERN = Pattern.compile("\\b(hi|hello|hey|greetings)\\b");
    private static final Pattern HELP_PATTERN = Pattern.compile("\\b(help|assist)\\b");

    @Override
    public String getProviderName() {
        return "mock";
    }

    @Override
    public String generateReply(String userMessage) {
        if (userMessage == null || userMessage.trim().isEmpty()) {
            return "Hello! How can I assist you with your RoshnaMart shopping today?";
        }

        String lower = userMessage.toLowerCase(Locale.ROOT).trim();

        // 1. Coupons & Discounts
        if (lower.contains("coupon") || lower.contains("discount") || lower.contains("promo") || lower.contains("offer") || lower.contains("voucher") || lower.contains("welcome10") || lower.contains("roshna20") || lower.contains("save50")) {
            return "Here are the active RoshnaMart coupon codes:\n"
                    + "• WELCOME10: 10% off on orders above ₹500 (Max ₹200 off)\n"
                    + "• ROSHNA20: 20% off on orders above ₹1,500 (Max ₹500 off)\n"
                    + "• SAVE50: Flat ₹50 off on orders above ₹300\n"
                    + "You can apply these during checkout in your order summary!";
        }

        // 2. Order Tracking & Status
        if (lower.contains("track") || lower.contains("order status") || lower.contains("where is my order") || lower.contains("shipment status")) {
            return "You can track your orders in real-time by going to your Buyer Dashboard → 'My Orders' (or /buyer/orders). "
                    + "Each order item shows an interactive timeline covering PLACED → PROCESSING → SHIPPED → DELIVERED.";
        }

        // 3. Shipping charges & Free Delivery
        if (lower.contains("shipping") || lower.contains("delivery charge") || lower.contains("free delivery") || lower.contains("delivery fee")) {
            return "RoshnaMart offers Free Standard Delivery on orders exceeding the threshold of ₹999! "
                    + "For orders below ₹999, a standard delivery fee of ₹40 applies. Your cart dynamically calculates and displays your progress toward free shipping.";
        }

        // 4. Return, Refund & Cancellation
        if (lower.contains("return") || lower.contains("refund") || lower.contains("cancel") || lower.contains("replacement")) {
            return "RoshnaMart offers a hassle-free 7-day return policy for eligible products once delivered. "
                    + "To initiate a return or view return status, visit 'My Orders', select the order item, and request a return. Refunds are credited back to your original payment method within 3–5 business days.";
        }

        // 5. Payment Methods & Sandbox
        if (PAYMENT_PATTERN.matcher(lower).find()) {
            return "RoshnaMart supports multiple secure payment methods:\n"
                    + "• Credit & Debit Cards (Visa, MasterCard, RuPay)\n"
                    + "• UPI (Google Pay, PhonePe, Paytm, BHIM)\n"
                    + "• Net Banking\n"
                    + "• Online Payment Sandbox simulator for instant test transactions!";
        }

        // 6. How to place an order / Checkout process
        if (lower.contains("how to order") || lower.contains("how to buy") || lower.contains("place order") || lower.contains("checkout")) {
            return "Placing an order on RoshnaMart is simple:\n"
                    + "1. Browse our catalog and click 'Add to Cart'.\n"
                    + "2. Go to your Cart to review items (grouped automatically by vendor).\n"
                    + "3. Proceed to Checkout, select or add your delivery address.\n"
                    + "4. Apply any promo coupons and complete payment via our secure payment modal!";
        }

        // 7. Products & Categories sold
        if (lower.contains("product") || lower.contains("category") || lower.contains("categories") || lower.contains("catalog") || (lower.contains("sell") && lower.contains("what"))) {
            return "RoshnaMart features a wide selection across major categories:\n"
                    + "• Electronics & Audio (Wireless headphones, smartwatches, gadgets)\n"
                    + "• Fashion & Apparel (Men's & women's urban wear)\n"
                    + "• Pure Organics & Groceries (Organic foods, teas, honey)\n"
                    + "• Home Essentials & Personal Care\n"
                    + "Explore the full selection on our 'Products' page with search and category filters!";
        }

        // 8. Become a Seller / Seller Onboarding
        if (lower.contains("become a seller") || lower.contains("register as seller") || lower.contains("sell on roshnamart") || lower.contains("merchant") || lower.contains("vendor registration")) {
            return "To sell on RoshnaMart, click 'Become a Seller' or visit /register/seller to create your merchant account. "
                    + "Once submitted, Platform Administrators review and approve your store. Once approved, you gain access to the dedicated Seller Dashboard to list products and fulfill orders!";
        }

        // 9. Customer Support / Contact
        if (lower.contains("support") || lower.contains("contact") || lower.contains("help desk") || lower.contains("customer care") || lower.contains("helpline") || lower.contains("support email")) {
            return "Our customer care team is available 24/7 to assist you!\n"
                    + "• Email: support@roshnamart.com\n"
                    + "• Help Center: Visit our 'About' page or help desk.\n"
                    + "• Live Assistant: Ask me any questions regarding products, orders, returns, or seller accounts right here!";
        }

        // 10. Multi-vendor Marketplace Architecture & Isolation
        if (lower.contains("multi-vendor") || lower.contains("seller isolation") || lower.contains("vendor isolation") || lower.contains("marketplace architecture")) {
            return "RoshnaMart is an enterprise-grade multi-vendor marketplace. Each seller operates in strict data isolation—only accessing their own products, fulfillment orders, and analytics. Buyers enjoy a unified multi-vendor cart and seamless consolidated checkout!";
        }

        // General Greetings
        if (GREETING_PATTERN.matcher(lower).find() || HELP_PATTERN.matcher(lower).find()) {
            return "Hello! I am your RoshnaMart Shopping Assistant. How can I help you today? You can ask me about product categories, tracking your orders, shipping fees, return policies, active coupons, or how to become a seller.";
        }

        // Out of domain query restriction (enforce product/listing domain scope)
        return "I am RoshnaMart's shopping assistant. I can only answer questions related to RoshnaMart product listings, orders, deliveries, returns, coupons, and seller inquiries. How can I assist with your shopping today?";
    }
}
