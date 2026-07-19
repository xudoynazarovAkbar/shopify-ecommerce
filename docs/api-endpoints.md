# 📖 Shopify Multi-Vendor Marketplace API Reference

This document outlines the complete REST API endpoints provided by the NestJS backend, complete with roles, payloads, and validation constraints. It serves as our single source of truth for developing the Nuxt 3 Frontend integrations.

---

## 🔐 1. Authentication (`/auth`)

*Public and authenticated session management using JWT.*

### `POST /auth/register`
*   **Access:** Public
*   **Description:** Register a new user (either BUYER or VENDOR). If VENDOR, initializes a PENDING vendor profile. If BUYER, initializes an empty cart.
*   **Payload (JSON):**
    ```json
    {
      "email": "user@example.com",
      "password": "Password123",
      "role": "BUYER", // "BUYER" or "VENDOR" (defaults to "BUYER")
      "shopName": "My Awesome Shop", // (Required if role is "VENDOR")
      "shopDescription": "We sell cool things" // (Optional, if role is "VENDOR")
    }
    ```
*   **Response (201 Created):**
    ```json
    {
      "id": "user-uuid",
      "email": "user@example.com",
      "role": "BUYER",
      "createdAt": "2026-07-19T12:00:00.000Z"
    }
    ```

### `POST /auth/login`
*   **Access:** Public
*   **Description:** Log in an existing user. For VENDOR role, login is blocked (throws 401) unless their vendor profile status is `APPROVED`.
*   **Payload (JSON):**
    ```json
    {
      "email": "user@example.com",
      "password": "Password123"
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "accessToken": "jwt-token-string"
    }
    ```

### `GET /auth/profile`
*   **Access:** Authenticated (BUYER, VENDOR, or ADMIN)
*   **Description:** Fetch profile details of the current logged-in user.
*   **Response (200 OK):**
    ```json
    {
      "id": "user-uuid",
      "email": "user@example.com",
      "role": "VENDOR",
      "vendorProfile": {
        "id": "vendor-uuid",
        "shopName": "My Awesome Shop",
        "status": "APPROVED"
      }
    }
    ```

---

## 🏪 2. Merchant & Vendor Profiles (`/vendors` / `/admin/vendors`)

*Vendor onboarding, profile viewing, and administrative trust governance.*

### `POST /vendors/register`
*   **Access:** Public
*   **Description:** Alternative merchant onboarding form. Registers a VENDOR account directly (similar to registering with role VENDOR under auth).
*   **Payload (JSON):** Same as Register but specialized for VENDORS.

### `GET /vendors`
*   **Access:** Public
*   **Description:** List all `APPROVED` vendor profiles with aggregate ratings.
*   **Response (200 OK):**
    ```json
    [
      {
        "id": "vendor-uuid",
        "shopName": "Burger Palace",
        "shopDescription": "Tasty burgers",
        "createdAt": "2026-07-19...",
        "averageRating": 4.5,
        "reviewCount": 12
      }
    ]
    ```

### `GET /vendors/:id`
*   **Access:** Public
*   **Description:** Fetch a vendor's public storefront details including aggregated reviews and rating metrics.
*   **Response (200 OK):**
    ```json
    {
      "id": "vendor-uuid",
      "shopName": "Burger Palace",
      "shopDescription": "Tasty burgers",
      "averageRating": 4.5,
      "reviewCount": 12,
      "reviews": [
        {
          "id": "review-uuid",
          "rating": 5,
          "comment": "Perfect burgers!",
          "buyer": { "email": "buyer@test.com" }
        }
      ]
    }
    ```

### `GET /vendors/profile`
*   **Access:** Authenticated (VENDOR)
*   **Description:** Fetch the logged-in merchant's own business profile.

### `PATCH /admin/vendors/:id/status`
*   **Access:** Authenticated (ADMIN)
*   **Description:** System Admin approves or rejects a pending vendor registration.
*   **Payload (JSON):**
    ```json
    {
      "status": "APPROVED" // "PENDING", "APPROVED", "REJECTED"
    }
    ```

### `PATCH /admin/vendors/:id/trust`
*   **Access:** Authenticated (ADMIN)
*   **Description:** Set automatic product approval trust-level. High-trust merchants (`true`) have newly added products bypass moderation.
*   **Payload (JSON):**
    ```json
    {
      "autoApproveProducts": true
    }
    ```

---

## 🗂️ 3. Categories Management (`/categories`)

*Global categorization schema for organizing products.*

### `POST /categories`
*   **Access:** Authenticated (ADMIN)
*   **Payload:** `{ "name": "Electronics", "description": "Gadgets" }`

### `GET /categories`
*   **Access:** Public
*   **Description:** List all global categories.

### `PATCH /categories/:id`
*   **Access:** Authenticated (ADMIN)
*   **Payload:** `{ "name": "New Name", "description": "New description" }`

### `DELETE /categories/:id`
*   **Access:** Authenticated (ADMIN)
*   **Description:** Deletes a category. Blocked (409 Conflict) if the category currently contains products.

---

## 🍔 4. Products & Moderation Queue (`/products` / `/admin/products`)

*Product management and conditional moderation.*

### `POST /products`
*   **Access:** Authenticated (VENDOR)
*   **Description:** Create a new product. If vendor is trusted (`autoApproveProducts: true`), product status is `APPROVED` (publicly visible). Otherwise, status is `PENDING_APPROVAL` (hidden from buyers).
*   **Payload (JSON):**
    ```json
    {
      "categoryId": "category-uuid",
      "name": "Cheeseburger",
      "description": "Double patty and cheddar",
      "price": 8.99,
      "image": "https://url.com/image.png"
    }
    ```

### `GET /products`
*   **Access:** Public
*   **Description:** List all public, `APPROVED` products. Supports optional filtering by category and basic text search.
*   **Query Parameters:**
    - `categoryId`: Filter by category UUID.
    - `search`: Filter by name/description fuzzy match.

### `GET /products/my-shop`
*   **Access:** Authenticated (VENDOR)
*   **Description:** List all products belonging to the logged-in merchant (regardless of status).

### `GET /products/:id`
*   **Access:** Public
*   **Description:** Fetch details of a single approved product.

### `PATCH /products/:id`
*   **Access:** Authenticated (VENDOR)
*   **Description:** Update product details. **Note:** If the merchant is untrusted, updating a product automatically resets its status back to `PENDING_APPROVAL`, temporarily hiding it from buyers.
*   **Payload (JSON):** Any product fields to update.

### `DELETE /products/:id`
*   **Access:** Authenticated (VENDOR)
*   **Description:** Delete own product.

### `GET /admin/products/pending`
*   **Access:** Authenticated (ADMIN)
*   **Description:** List all products pending review in the system-wide moderation queue.

### `PATCH /admin/products/:id/status`
*   **Access:** Authenticated (ADMIN)
*   **Description:** Admin approves or rejects a pending product.
*   **Payload (JSON):** `{ "status": "APPROVED" }` // "PENDING_APPROVAL", "APPROVED", "REJECTED"

---

## 🛒 5. Scoped Shopping Cart (`/cart`)

*Persistent buyers' carts that enforce the single-vendor rule.*

### `GET /cart`
*   **Access:** Authenticated (BUYER)
*   **Description:** Retrieves the buyer's active cart. It calculates subtotals, tax (10%), flat delivery fee ($5.00), and final totals on the fly.
*   **Response (200 OK):**
    ```json
    {
      "id": "cart-uuid",
      "buyerId": "buyer-uuid",
      "vendorId": "vendor-uuid",
      "subtotal": 17.98,
      "tax": 1.80,
      "deliveryFee": 5.00,
      "total": 24.78,
      "vendor": { "id": "vendor-uuid", "shopName": "Burger Palace" },
      "items": [
        {
          "id": "cart-item-uuid",
          "productId": "product-uuid",
          "quantity": 2,
          "product": { "id": "product-uuid", "name": "Cheeseburger", "price": 8.99 }
        }
      ]
    }
    ```

### `POST /cart/items`
*   **Access:** Authenticated (BUYER)
*   **Description:** Add a product to the cart. Enforces the **single-vendor checkout rule** (throws 400 Bad Request if the product belongs to a different merchant than existing items in the cart).
*   **Payload (JSON):**
    ```json
    {
      "productId": "product-uuid",
      "quantity": 1
    }
    ```

### `PATCH /cart/items/:id`
*   **Access:** Authenticated (BUYER)
*   **Description:** Update the quantity of a specific cart item.
*   **Payload (JSON):** `{ "quantity": 3 }`

### `DELETE /cart/items/:id`
*   **Access:** Authenticated (BUYER)
*   **Description:** Remove an item from the cart. If the last item is removed, the cart's locked `vendorId` resets to `null`.

### `DELETE /cart`
*   **Access:** Authenticated (BUYER)
*   **Description:** Empty the entire cart and reset the locked `vendorId` to `null`.

---

## 🧾 6. Order Management & Checkout (`/orders`)

*Secure transaction ledger, checkout, and historical lists.*

### `POST /orders/checkout`
*   **Access:** Authenticated (BUYER)
*   **Description:** Converts the active cart into a confirmed order. It handles discount calculations from coupon codes, verifies tokenized credit cards, records order details inside a database `$transaction`, and empties the cart.
*   **Payload (JSON):**
    ```json
    {
      "promoCode": "BURGER20", // (Optional)
      "savedCardId": "card-uuid" // (Optional)
    }
    ```
*   **Response (210 Created):** Returns the created `Order` containing a unique `id` (UUID) and a sequentially incremented `order_number` integer (1, 2, 3...) scoped to the system ledger.

### `GET /orders/buyer`
*   **Access:** Authenticated (BUYER)
*   **Description:** Fetch past orders placed by the current buyer.

### `GET /orders/vendor`
*   **Access:** Authenticated (VENDOR)
*   **Description:** Fetch orders received by the merchant's shop.

### `PATCH /orders/:id/status`
*   **Access:** Authenticated (VENDOR)
*   **Description:** Merchant updates order fulfillment status.
*   **Payload (JSON):** `{ "status": "COMPLETED" }` // "PENDING", "COMPLETED", "CANCELLED"

---

## 🎟️ 7. Promo Codes & Coupons (`/coupons`)

*Merchant-specific promotional code system.*

### `POST /coupons`
*   **Access:** Authenticated (VENDOR)
*   **Description:** Create a custom shop coupon. The code is normalized to uppercase automatically.
*   **Payload (JSON):**
    ```json
    {
      "code": "BURGER20",
      "discountType": "PERCENTAGE", // "PERCENTAGE" or "FLAT"
      "discountValue": 20.0, // 20% or $20 flat discount
      "expirationDate": "2026-12-31T23:59:59.000Z" // (Optional)
    }
    ```

### `GET /coupons`
*   **Access:** Authenticated (VENDOR)
*   **Description:** List all promotional codes active or expired under this shop.

### `PATCH /coupons/:id`
*   **Access:** Authenticated (VENDOR)
*   **Payload (JSON):** `{ "isActive": false }`

---

## 💳 8. Payment Card Vaulting (`/payments`)

*Tokenized simulation of secure credit card storage.*

### `POST /payments/cards`
*   **Access:** Authenticated (BUYER)
*   **Description:** Securely vaults a buyer's payment card. Simulates Stripe vaulting by assigning a token.
*   **Payload (JSON):**
    ```json
    {
      "cardToken": "tok_123456",
      "brand": "Visa",
      "last4": "4242",
      "expMonth": 12,
      "expYear": 2029
    }
    ```

### `GET /payments/cards`
*   **Access:** Authenticated (BUYER)
*   **Description:** List saved payment card tokens (raw numbers are not saved or exposed).

### `DELETE /payments/cards/:id`
*   **Access:** Authenticated (BUYER)
*   **Description:** Delete a saved payment card.

---

## ⭐ 9. Two-Way Customer Reviews (`/reviews`)

*Post-purchase review and rating feedback engine.*

### `POST /reviews`
*   **Access:** Authenticated (BUYER)
*   **Description:** Submit a review and rating for a vendor. Only allowed if:
    - The `orderId` is valid, is completed, and belongs to the buyer.
    - No previous review has been submitted for this order (1 review per order rule).
*   **Payload (JSON):**
    ```json
    {
      "orderId": "order-uuid",
      "rating": 5, // Integer 1 to 5
      "comment": "Absolutely outstanding food and fast delivery!"
    }
    ```

### `GET /reviews/vendor/:vendorId`
*   **Access:** Public
*   **Description:** List all customer reviews posted for a specific merchant.

---

## 🔍 10. Centralized Omnipresent Search (`/search`)

*System-wide fuzzy search engine.*

### `GET /search`
*   **Access:** Public
*   **Description:** Fuzzy-matches a text string against approved product names/descriptions and approved vendor shop names/descriptions.
*   **Query Parameters:**
    - `q`: Search keyword (e.g. `/search?q=pizza`). If missing or empty, returns empty groups.
*   **Response (200 OK):**
    ```json
    {
      "products": [
        {
          "id": "product-uuid",
          "name": "Pepperoni Pizza",
          "price": 14.99,
          "category": { "name": "Fast Food" },
          "vendor": { "id": "vendor-uuid", "shopName": "Pizza Paradise" }
        }
      ],
      "vendors": [
        {
          "id": "vendor-uuid",
          "shopName": "Pizza Paradise",
          "shopDescription": "Delicious cheesy pizzas"
        }
      ]
    }
    ```
