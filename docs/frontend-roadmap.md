# 🗺️ Shopify Multi-Vendor Marketplace - Frontend Roadmap

This document serves as a persistent guide and status tracker for the Nuxt 3 frontend implementation. It outlines completed modules, architectural constraints, and next-step milestones to allow seamless continuation across sessions.

---

## 🚦 System Architecture & Guidelines

### 1. Localize-as-you-Build (i18n)
* **Strict Rule:** Never hardcode static strings in Vue templates.
* **Locales Supported:** English (`en`), Russian (`ru`), Uzbek (`uz`).
* **Source Files:** `frontend/app/locales/{en,ru,uz}.json`
* **Reference Syntax:** `$t('section.key')` or `useNuxtApp().$i18n.t(...)`

### 2. Styling & Theme Tokenization
* **Strict Rule:** Avoid hardcoding static color classes (e.g., `bg-white`, `text-slate-900`) directly on components.
* **Mechanism:** Use semantic tailwind variables defined inside `frontend/app/assets/css/main.css` and mapped inside `frontend/tailwind.config.ts`.
* **Semantic Palette:**
  * Backgrounds: `bg-appBg` (Main application background), `bg-cardBg` (Card component container background)
  * Typography: `text-textPrimary` (High contrast text), `text-textSecondary` (Body/secondary text), `text-textMuted` (Muted captions)
  * Accents: `bg-brand` / `hover:bg-brandHover` (Indigo/Blue brand button), `text-brandText` (Contrasting label on brand buttons)
  * Borders: `border-appBorder` (Divider lines, input bounds)

### 3. Component Decomposition
* **Strict Rule:** Keep page files lightweight (< 100 lines) and dedicated to route setup.
* **Decomposition Strategy:** Extract UI elements into page-specific subdirectories under `components/` (e.g., `components/login/LoginForm.vue`, `components/register/RegisterForm.vue`). Place highly reusable elements (buttons, inputs) under `components/common/`.

### 4. Custom Composables for Business Logic
* **Strict Rule:** Keep components completely presentation-focused.
* **Mechanism:** Extract all state, form input handling, loading flags, and API integration into custom Vue composables under `frontend/app/composables/` (e.g., `useLogin.ts`, `useRegister.ts`).

---

## 📊 Feature Status & Implementation Chunks

```text
+---------------------------------------------------------------------------------+
|                                 FRONTEND ROADMAP                                |
+---------------------------------------------------------------------------------+
|                                                                                 |
|  [Chunk 1: Buyer Discovery]  ==>  [Chunk 2: Checkout Engine] ==> [Chunk 3: Order Management]
|  - Search Results Page            - Scoped Cart View             - Buyer Order History
|  - Vendor Public Profile Page      - Merchant Coupon Input        - 1-5 Star Review Form
|                                    - Card Vault Selection        
|                                                                                 |
|                                       ||                                        |
|                                       \/                                        |
|                                                                                 |
|                        [Chunk 4: Vendor Hub (Dashboard)]                        |
|                        - Product Catalog Management (with Moderation State)     |
|                        - Promo Code/Coupon CRUD Engine                          |
|                        - Vendor-Scoped Order Execution                          |
|                                                                                 |
|                                       ||                                        |
|                                       \/                                        |
|                                                                                 |
|                         [Chunk 5: Admin Control Panel]                          |
|                         - Global Category Management                            |
|                         - Merchant Registration Onboarding approvals            |
|                         - Vendor auto-approval trust toggles                    |
|                         - Product Moderation Queue                              |
+---------------------------------------------------------------------------------+
```

### ✅ Completed Milestones
* **Core Store Shells:** Completed auth state (`auth.ts`), cart state (`cart.ts`), and toast feedback (`toast.ts`) under Pinia.
* **Root & Global Nav:** Configured global header navigation, Sticky bar, Language Switcher, Theme Switcher, and full reactive responsive layouts.
* **Login & Registration Flow:** Secure register & login fully localized and decomposed into reusable form composables and UI chunks.
* **Marketplace Homepage:** Multi-section view of Category grids, featured stores, and fresh product additions.

---

### 🚀 Chunk 1: Buyer Discovery (Storefront & Search) — **UP NEXT**

#### 1. Search Results page (`frontend/app/pages/search.vue`)
* **Endpoint:** `GET /search?q=query`
* **Features:**
  * Perform case-insensitive, fuzzy matching across product, shop, and restaurant names.
  * Render products and vendors in distinct, clean, grid-based columns.
  * Handles empty or missing search queries gracefully with stylized instructions.
* **Key Files to Create:**
  * `frontend/app/pages/search.vue`
  * `frontend/app/components/search/SearchResultGrid.vue`
  * `frontend/app/composables/useSearch.ts`

#### 2. Vendor Public Profile Storefront (`frontend/app/pages/vendors/[id].vue`)
* **Endpoint:** `GET /vendors/:id`
* **Features:**
  * Header showcasing the vendor logo, description, and dynamic aggregated rating (average stars and count).
  * Tabbed or clean grid layout sorting categories/products available at this vendor.
  * Direct "Add to Cart" button linked to the scoped cart store.
  * Under-the-fold customer reviews ledger displaying individual user ratings and text comments.
* **Key Files to Create:**
  * `frontend/app/pages/vendors/[id].vue`
  * `frontend/app/components/vendors/StorefrontHeader.vue`
  * `frontend/app/components/vendors/ProductCatalog.vue`
  * `frontend/app/components/vendors/StorefrontReviews.vue`
  * `frontend/app/composables/useVendorStorefront.ts`

---

### 💳 Chunk 2: Cart & Scoped Checkout Engine

#### 1. Scoped Shopping Cart (`frontend/app/pages/cart.vue`)
* **Endpoint:** `GET /cart`, `POST /cart/items`, `PATCH /cart/items/:id`, `DELETE /cart/items/:id`, `DELETE /cart`
* **Features:**
  * Lists active cart items with subtotals, calculated taxes, delivery fees, and dynamic final price.
  * Enforces the **single-vendor rule** via modal dialog: "Adding this product will clear your current cart from another vendor. Proceed?"
  * Validates and applies merchant-scoped, subtotal-capped promotion coupons.
  * Handles checkout card selection by integrating with the Payment Vaulting store.
* **Key Files to Create:**
  * `frontend/app/pages/cart.vue`
  * `frontend/app/components/cart/CartItemRow.vue`
  * `frontend/app/components/cart/CouponInput.vue`
  * `frontend/app/components/cart/SavedCardSelector.vue`

---

### 📦 Chunk 3: Order History & Two-Way Reviews

#### 1. Buyer Orders Ledger (`frontend/app/pages/buyer/orders.vue`)
* **Endpoint:** `GET /orders/my-orders`
* **Features:**
  * List historical buyer orders displaying sequential human-readable `order_number` values, date, vendor, total, and status labels (`PENDING`, `COMPLETED`, `CANCELLED`).
  * Shows detailed order items list within toggleable accordions.
* **Key Files to Create:**
  * `frontend/app/pages/buyer/orders.vue`
  * `frontend/app/components/orders/OrderItemAccordion.vue`

#### 2. Post-Checkout Review submission (`frontend/app/components/orders/ReviewFormModal.vue`)
* **Endpoint:** `POST /reviews`
* **Features:**
  * Triggers a modal for COMPLETED orders allowing the user to select 1-to-5 stars and write a custom feedback review of their storefront experience.
* **Key Files to Create:**
  * `frontend/app/components/orders/ReviewFormModal.vue`

---

### 🏪 Chunk 4: Merchant Vendor Hub

#### 1. Vendor Control Center (`frontend/app/pages/vendor/index.vue`)
* **Endpoints:** `GET /vendors/profile`, `GET /orders/vendor-orders`, `PATCH /orders/:id/status`
* **Features:**
  * Comprehensive dashboard for the merchant to track incoming customer orders, manage statuses, and visualize their public profile.
  * Displays merchant's status (`PENDING`, `APPROVED`, `REJECTED`) and trust level (`auto_approve_products` indicator).
* **Key Files to Create:**
  * `frontend/app/pages/vendor/index.vue`
  * `frontend/app/components/vendor/IncomingOrdersList.vue`

#### 2. Product Catalog Management (`frontend/app/pages/vendor/products.vue`)
* **Endpoints:** `POST /products`, `PATCH /products/:id`, `DELETE /products/:id`
* **Features:**
  * Add, update, or remove products within categories.
  * Visually displays product status badge: `APPROVED` (published to marketplace) or `PENDING_APPROVAL` (under admin moderation review).
* **Key Files to Create:**
  * `frontend/app/pages/vendor/products.vue`
  * `frontend/app/components/vendor/ProductFormModal.vue`

#### 3. Promo & Coupon CRUD Management (`frontend/app/pages/vendor/coupons.vue`)
* **Endpoints:** `POST /coupons`, `PATCH /coupons/:id`, `DELETE /coupons/:id`
* **Features:**
  * Create merchant-scoped coupons with a defined discount rate (percentage or flat rate), code, and expiration dates.
* **Key Files to Create:**
  * `frontend/app/pages/vendor/coupons.vue`
  * `frontend/app/components/vendor/CouponFormModal.vue`

---

### 🛡️ Chunk 5: Admin Control Panel

#### 1. Category Setup (`frontend/app/pages/admin/categories.vue`)
* **Endpoints:** `GET /categories`, `POST /categories`
* **Features:**
  * Simple form to establish global product and merchant categories (e.g., Electronics, Fast Food).
* **Key Files to Create:**
  * `frontend/app/pages/admin/categories.vue`

#### 2. Prospect Merchant & Products Moderation (`frontend/app/pages/admin/index.vue`)
* **Endpoints:**
  * `GET /admin/vendors` (list registration applications)
  * `PATCH /admin/vendors/:id/status` (approve/reject vendor)
  * `PATCH /admin/vendors/:id/trust` (toggle auto-approve trust)
  * `GET /admin/products` (moderate product queue)
  * `PATCH /products/:id/status` (approve/reject product addition)
* **Features:**
  * Approval screen for merchant onboarding submissions.
  * Setting high-trust merchant toggle flags to bypass manual product reviews.
  * System-wide product queue to manually authorize products from low-trust merchants.
* **Key Files to Create:**
  * `frontend/app/pages/admin/index.vue`
  * `frontend/app/components/admin/VendorApprovalCard.vue`
  * `frontend/app/components/admin/ProductModerationRow.vue`
