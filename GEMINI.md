# 📌 Project Blueprint: Shopify (Multi-Vendor Marketplace)
**Tech Stack:** Nuxt 3 (Frontend) | NestJS (Backend API) | PostgreSQL (Database) | TypeScript (Full-Stack) | JWT (Authentication)

### 👥 User Roles & Access Control
The application enforces role-based access control (RBAC) via JWT, dynamically rendering three custom dashboards:

```text
                  +----------------------------------------+
                  |            JWT Auth Gateway            |
                  +----------------------------------------+
                                       |
       +-------------------------------+-------------------------------+
       |                               |                               |
       v                               v                               v
+--------------+               +---------------+               +---------------+
|  1. BUYER    |               |  2. VENDOR    |               |  3. ADMIN     |
|  - Browse    |               |  - Manage Shop|               |  - Approvals  |
|  - Cart      |               |  - Products   |               |  - Categories |
|  - Checkout  |               |  - Promos     |               |  - System-wide|
+--------------+               +---------------+               +---------------+
```

---

### ⚙️ Core Feature Specifications

#### 1. Prospect Merchant Registration & Trust Governance
*   **Description:** New shops and restaurants can register by completing an onboarding form. Upon submission, their account status is set to `PENDING`. System Administrators must review and approve applications. 
*   **Trust Tiering:** Upon approval, Admins can configure an `auto_approve_products` boolean flag for each vendor. High-trust merchants get automatic product approvals, while new or low-trust merchants require manual product reviews.

#### 2. Dynamic Categorization & Conditional Product Moderation
*   **Description:** System Admins create global product categories (e.g., *Electronics*, *Fast Food*). Merchants manage their own catalogs by adding products to these categories.
*   **Moderation Engine:** When a merchant adds/updates a product, the backend checks their `auto_approve_products` setting:
    *   If `true`: Product is instantly created with status `APPROVED` and is visible to buyers.
    *   If `false`: Product is created with status `PENDING_APPROVAL`. It remains hidden from buyers and is routed to the Admin's moderation queue for manual review.

#### 3. Scoped Cart Engine (Single-Vendor Checkout)
*   **Description:** A shopping cart that calculates item subtotals, applicable taxes, delivery fees, and the overall total. 
*   **Constraint:** The system strictly enforces a **single-vendor rule**: *A buyer can only add products from one specific shop or restaurant at a time.* Attempting to add an item from a different vendor will prompt the user to clear their existing cart first.

#### 4. Dual-Keyed Order Management System
*   **Description:** Every order generated persists in a historical ledger. Each order record must contain:
    *   A secure, non-guessable `UUID` (Primary database key).
    *   A buyer's reference `UUID` and the vendor's reference `UUID`.
    *   A human-readable `order_number` that automatically increments sequentially (1, 2, 3...) starting from 1.

#### 5. Merchant Coupon & Promo Code Engine
*   **Description:** Individual shops and restaurants can create custom promotional codes (e.g., `BURGER20`) with defined discount rates (percentage or flat-rate deductions). These codes are scoped exclusively to their respective storefront and validated during the scoped cart checkout process.

#### 6. Tokenized Payment Card Vaulting
*   **Description:** Buyers can securely link their payment cards to their accounts. Card details must be securely tokenized (simulating Stripe/Adyen vaulting) so users can seamlessly select and reuse their saved payment methods for future purchases without re-entering credentials.

#### 7. Two-Way Customer Review & Rating Engine
*   **Description:** After a successful order completion, buyers are permitted to rate their experience with the shop or restaurant on a 1-to-5 star scale and submit a written feedback review. These ratings aggregate to display an overall score on the vendor's public profile.

#### 8. Omnipresent Index Search
*   **Description:** A central search utility available to buyers that executes fuzzy matching queries across three fields: product name, shop name, and restaurant name, quickly returning grouped, relevant results.

---

### 📐 AI Implementation Guidelines & Database Schema

**To the AI Agent:** When generating the PostgreSQL database schema using Prisma or TypeORM, ensure the following critical constraints are met:

1.  **Order Numbering:** Use PostgreSQL's `SERIAL` (or `AUTOINCREMENT` sequence) for the human-readable `order_number`, while maintaining `UUID` as the primary key `id`.
2.  **Cart Enforcement:** In the `Cart` or `Order` validation service, strictly check that incoming `product.vendorId` matches the `vendorId` of existing items in the active cart/session. Throw a 400 error if there is a mismatch.
3.  **Auth Payload:** Ensure the JWT payload includes `{ "sub": "userId", "role": "ROLE_NAME" }` so the Nuxt middleware can route UI experiences purely off the token state without an extra DB call.

**Required Moderation Fields:**
```sql
-- Ensure the vendors table includes the trust flag:
ALTER TABLE vendors ADD COLUMN auto_approve_products BOOLEAN DEFAULT false;

-- Ensure the products table supports moderation statuses:
ALTER TABLE products ADD COLUMN status VARCHAR DEFAULT 'PENDING_APPROVAL'; 
-- Enum: 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'
```

---

### 🔄 Git Workflow & Incremental Commits

To ensure code reviews are clean, structured, and easy to parse, always divide development into highly isolated, sequential chunks.
*   **Logical Chunking:** Implement one logical feature at a time, verify its compilation, and validate it with tests before writing any code for the next feature.
*   **Pause & Commit Reminder:** After completing any logical feature block (e.g., initial folder structures, database schema definitions, JWT authentication logic, etc.), **the AI must STOP and explicitly remind the user to review and commit their changes** before starting on the next block. Do not write code for subsequent features until the current chunk is approved or committed.

***