# 🏪 Shopify Multi-Vendor Marketplace (Monorepo)

An enterprise-grade, high-performance **Multi-Vendor E-Commerce Marketplace** (Shopify Clone) built using a highly optimized, modern monorepo architecture. The project leverages **Nuxt 3** on the frontend for an ultra-fast, SEO-friendly storefront, **NestJS** on the backend for a robust, scalable REST API, and **Prisma ORM** with **PostgreSQL** for database management and type-safe data access.

---

## 🛠️ Architecture & Tech Stack

This repository is organized as an **NPM Workspaces Monorepo** containing two main sub-projects:

1. **`frontend` (Nuxt 3 SPA/SSR):** Runs on [http://localhost:3000](http://localhost:3000)
   - *Core Technologies:* Vue 3 (Composition API, `<script setup>`), Pinia (State Management), TailwindCSS (Aesthetic Themes), Swiper (Carousels), Vee-Validate & Yup (Schema Validation), Vue-ChartJS (Analytics), and Nuxt i18n (Multilingual Support).
2. **`backend` (NestJS REST API):** Runs on [http://localhost:3001](http://localhost:3001)
   - *Core Technologies:* NestJS (Express framework), Passport.js (JWT Authentication), Prisma ORM (Database client), Class-Validator & Class-Transformer (Payload validation), and PostgreSQL (Relational Database).

---

## ⚙️ Core Feature Specifications

### 1. 👥 Multi-Role Access Control (RBAC)
The platform enforces strict, role-based security at both the frontend (middleware) and backend (guards) levels using secure JSON Web Tokens (JWT).
- **Access Tokens:** 15-minute lifespan.
- **Refresh Tokens:** 7-day secure cookie-based session management.
- **JWT Payload Structure:** `{ "sub": "userId", "role": "ROLE_NAME" }`
- **Supported Roles:**
  - `BUYER`: Browse categories, search products/vendors, manage shopping cart, secure credit card vaulting, checkout, and review/rate shops.
  - `VENDOR`: Complete vendor storefront management, store profile settings, live interactive analytics, catalog management (add/edit products with image uploading), coupons, and advertising.
  - `ADMIN`: Global administration dashboard. View platform health stats, approve/reject pending vendors, set merchant auto-approval trust tiers, globally CRUD product taxonomy/categories, moderate incoming products, and update platform commission settings.

### 2. 🏪 Storefront Onboarding & Trust Governance
- **Self-Service Registration:** Prospective vendors register directly on the platform, placing their store in a `PENDING` state.
- **Admin Review Pipeline:** Admins review storefront applications and can transition them to `APPROVED` or `REJECTED`.
- **Trust-Tiering Moderation:** Admins assign a trust flag (`auto_approve_products`) to approved vendors:
  - **High-Trust (Flag: `true`):** Newly added or edited products bypass manual inspection, transitioning instantly to `APPROVED` and appearing live.
  - **Low-Trust/New (Flag: `false`):** Added/edited products default to `PENDING_APPROVAL`, hiding them from public search and routing them to the Admin's moderation queue.

### 3. 🛒 Scoped Cart Engine (Single-Vendor Checkout)
- **Business Constraint:** Buyers are restricted to checking out products from **one single vendor/store at a time**.
- **Instant Validation:** When adding an item to the cart, the system checks if the incoming `product.vendorId` matches the existing items. If a mismatch is detected, the API rejects the request with a `400 Bad Request`, and the buyer is prompted to clear their current cart before adding items from another store.

### 4. 📈 Ad Banner Campaigns & Tiered Pricing
- **Ad Slot Bookings:** Approved vendors can submit creative marketing banners and assign them to specific home-screen carousel positions (Slots 1 to 12).
- **Tier-Based Flat Pricing:** Placement pricing is computed dynamically across Tier 1 (premium banner) down to Tier 4. Banners undergo Admin moderation before becoming active.

### 5. 🏷️ Custom Coupon & Promo Engine
- **Store-Scoped Discounts:** Vendors can generate custom promotional coupon codes (e.g. `BURGER20`).
- **Validation:** Coupons are scoped strictly to the issuing vendor's products. It supports `PERCENTAGE` or `FLAT` discount rules, calculated dynamically in real-time during checkout.

### 6. 🧾 Dual-Keyed Order Management System
- **Keys:** Every order generated persists with:
  - A secure, non-guessable `UUID` (Database primary key `id`).
  - A sequential, human-readable, sequential `order_number` (1, 2, 3...) managed using native PostgreSQL database sequences.
- **Ledger:** Keeps track of transaction history, subtotals, tax rates, delivery fees, and final platform commissions.

### 7. 💳 Tokenized Payment Card Vaulting
- **Simulated Stripe/Adyen:** Buyers securely vault credit/debit card credentials, which are returned as secure mock tokens for seamless, single-click checkouts in the future.

### 8. ⭐ Customer Review & Rating Engine
- **Feedback Loops:** Once an order is fully `COMPLETED`, buyers can rate the merchant (1-5 stars) and write a review. Ratings are aggregated to update the vendor's global average score.

### 9. 🔍 Omnipresent Fuzzy Index Search
- **Fuzzy Search:** A globally accessible header search bar queries and aggregates matches across:
  - Product Names
  - Shop/Vendor Names
  - Restaurant/Service Names

---

## 🔑 Login & Demo Credentials

The database seeding script populates multiple accounts across all roles. The default password for **every seeded account** is: `Password123`

| User Role | Email Address | Password | Details |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@shopify.com` | `Password123` | Full access to Admin Dashboard, Vendor Verification, Category CRUD, and Product Moderation. |
| **Apple Store (Vendor)** | `apple@shopify.com` | `Password123` | High-Trust electronics vendor containing populated inventory. |
| **Samsung Store (Vendor)**| `samsung@shopify.com`| `Password123` | High-Trust electronics vendor containing populated inventory. |
| **Zara (Vendor)** | `zara@shopify.com` | `Password123` | High-Trust fashion apparel vendor with populated items. |
| **Buyer Accounts** | *Self-Registration* | *Any Password* | **Recommended:** Go to the Register page on the app, choose "Buyer", and register a new account to test the customer shopping flow. |

---

## 🚀 Step-by-Step Setup Guide

Follow these steps to download, install dependencies, migrate the database, and spin up the multi-vendor marketplace locally.

### Step 1: Install System Prerequisites
Ensure you have the following installed on your local machine:
- **Node.js** (v18.x, v20.x, or v22.x recommended)
- **NPM** (v9.x or later, standard with Node)
- **PostgreSQL** database server running locally or in a cloud instance (e.g. Supabase, Render, neon.tech).

### Step 2: Clone & Install Monorepo Dependencies
Run this command from your terminal in the project root:
```bash
# Clone the repository
git clone <your-repository-url>
cd shopify-ecommerce

# Install dependencies for ALL workspaces (handled automatically by npm workspaces)
npm install
```
*Note: Due to our NPM Workspaces structure, all sub-dependencies are analyzed and hoisted cleanly into a single root `node_modules` folder, keeping the local workspace lightweight and free of redundant, duplicate folders.*

### Step 3: Configure Environment Variables
Create a `.env` file in the `backend/` directory:
```bash
# Navigate to the backend directory
cd backend
touch .env
```
Inside `backend/.env`, define your database connection string and secure JWT secret key:
```env
# PostgreSQL connection string
DATABASE_URL="postgresql://<db_user>:<db_password>@<db_host>:<db_port>/<db_name>?schema=public"

# Optional: Custom JWT Secret key (defaults to a safe fallback if omitted)
JWT_SECRET="your_custom_jwt_secret_key_here"
```

### Step 4: Setup Database & Seed Data
Initialize the database schemas, run migrations, generate the Prisma Client, and seed default categories, vendors, and products:
```bash
# Generate the Prisma Client and sync the schema with PostgreSQL
npx prisma migrate dev

# Explicitly generate the Prisma Client (required before seeding)
npx prisma generate

# Seed the database with default vendors, categories, products, and platform configurations
npx prisma db seed
```

### Step 5: Start the Services
You can run both the frontend and backend simultaneously directly from the **monorepo root folder** using our custom root script shortcuts:

```bash
# Run NestJS API (Starts on http://localhost:3001 with hot-reloading)
npm run dev:backend

# Run Nuxt 3 Storefront (Starts on http://localhost:3000 with hot-reloading)
npm run dev:frontend
```

---

## 🛠️ Monorepo Scripts Reference

From the **root folder**, you can execute commands across workspaces easily:

```bash
# Setup Husky git hooks
npm run prepare

# Run lint checks across both frontend and backend
npm run lint

# Build both frontend and backend for production deployment
npm run build
```

---

## 📁 Database Relationships (Prisma Models)

The PostgreSQL relational structure mapping is defined inside `backend/prisma/schema.prisma`:

```
┌───────────┐         ┌───────────┐         ┌───────────────┐
│   User    │1 ──────1│  Vendor   │1 ──────*│  Product      │
│ (RBAC Auth)│         │ (Approved)│         │(Moderation status)
└─────┬─────┘         └─────┬─────┘         └───────┬───────┘
      │1                    │1                      │1
      │                     │                       │
      │*                    │*                      │*
┌─────▼─────┐         ┌─────▼─────┐         ┌───────▼───────┐
│   Order   │* ──────1│  Coupon   │         │   CartItem    │
│(Auto No.) │         │(Store-Scoped)       │               │
└───────────┘         └───────────┘         └───────────────┘
```
