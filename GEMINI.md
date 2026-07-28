# 📌 Project Blueprint: Shopify (Multi-Vendor Marketplace)

This repository contains the full-stack implementation of a multi-vendor e-commerce marketplace (Shopify clone). The application features a modular frontend architecture powered by **Nuxt 3** and a high-performance backend API built with **NestJS** and **Prisma ORM** with **PostgreSQL**.

---

## 🛠️ Tech Stack & Ports

- **Frontend:** Nuxt 3 (Vue 3, Pinia, TailwindCSS, Swiper, Vee-Validate, Yup, i18n) — Runs on [http://localhost:3000](http://localhost:3000)
- **Backend:** NestJS (Express, Passport JWT, ValidationPipe, Class-Validator) — Runs on [http://localhost:3001](http://localhost:3001)
- **Database:** PostgreSQL (via Prisma Client)
- **Authentication:** Cookie-based and Bearer JWT (Access Token: 15m, Refresh Token: 7d)
- **CORS Setup:** Configured in NestJS `main.ts` to allow origins `http://localhost:3000` and `http://localhost:3002` with credential support.

---

## 👥 User Roles & Access Control

The application enforces strict Role-Based Access Control (RBAC) via JWT payload state:
- **JWT Payload Format:** `{ "sub": "userId", "role": "ROLE_NAME" }`
- **Roles:**
  - `BUYER`: Browse categories, search, manage cart, checkout (single-vendor constraint), rate/review vendors, save tokenized cards.
  - `VENDOR`: Register store, manage shop details, list products, customize discount coupons, view analytics, run ad campaigns.
  - `ADMIN`: Oversee system health, approve/reject pending vendors, set merchant auto-approval trust flags, CRUD global taxonomy/categories, moderate incoming products from untrusted vendors, update global platform settings.

---

## ⚙️ Core Feature Specifications

### 1. Prospect Merchant Onboarding & Trust Governance
- **Workflow:** Prospective stores register on the platform. Their initial account status is set to `PENDING`. System Admins review application details to approve or reject them.
- **Trust Tiering:** Upon approval, Admins configure an `auto_approve_products` (boolean) flag for the vendor:
  - **High-Trust:** Instantly approved products, bypassing moderation.
  - **Low-Trust/New:** Manual inspection required for any added or modified product.

### 2. Taxonomy Categorization & Conditional Product Moderation
- **Global Categories:** Defined and structured by Admins (e.g., *Electronics*, *Fast Food*, *Fashion*).
- **Moderation Engine:** When a vendor adds or updates a product, the backend audits their `auto_approve_products` setting:
  - If `true`: Product is saved with status `APPROVED` and becomes immediately visible on the storefront.
  - If `false`: Product is saved with status `PENDING_APPROVAL`, hidden from buyers, and routed to the Admin’s moderation inbox.

### 3. Scoped Cart Engine (Single-Vendor Checkout)
- **Constraint:** Buyers are strictly restricted to checking out products from **one single vendor/shop at a time**.
- **Validation:** When adding an item to the cart, the system validates that `product.vendorId` matches the `vendorId` of existing items in the cart. If a mismatch is detected, the API returns a `400 Bad Request`, prompting the user to clear their current cart before adding items from another vendor.

### 4. Dual-Keyed Order Management System
- **Keys:** Every order generated persists with:
  - A secure, non-guessable `UUID` (Database primary key `id`).
  - A human-readable `order_number` which is sequential (1, 2, 3...) starting from 1, managed using PostgreSQL sequences.
- **Ledger:** Keeps track of transaction history, subtotals, tax rates, delivery fees, and final platform commissions.

### 5. Merchant Coupon & Promo Code Engine
- **Custom Coupons:** Scoped exclusively to each individual vendor storefront.
- **Discounts:** Supports `PERCENTAGE` or `FLAT` discount values. Custom promotional codes (e.g., `BURGER20`) are validated against the current vendor's active items during checkout.

### 6. Tokenized Payment Card Vaulting
- **Simulated Stripe/Adyen:** Buyers securely vault credit/debit card credentials, which are returned as secure mock tokens for seamless, single-click checkouts in the future.

### 7. One-Way Customer Review & Rating Engine
- **Workflow:** Once an order is completed (`COMPLETED`), the buyer is eligible to write a review and supply a 1-to-5 star rating. Ratings are aggregated to determine the vendor's average reputation.

### 8. Omnipresent Index Search
- **Fuzzy Search:** A globally accessible header search bar queries and aggregates matches across:
  - Product Names
  - Shop/Vendor Names
  - Restaurant/Service Names

### 9. Banner Ad Campaigns & Pricing Settings
- **Features:** Vendors can submit creative banners for advertisement, choose visual placements (slide positions 1 to 12), and pay flat pricing models across Tier 1 (top slot) down to Tier 4. Admin reviews, approves, and can toggle active campaigns.

---

## 📁 Database Schema Reference (Prisma Models)

The PostgreSQL schema (`backend/prisma/schema.prisma`) implements the following main tables and enums:
- **Enums:** `Role` (BUYER, VENDOR, ADMIN), `VendorStatus` (PENDING, APPROVED, REJECTED), `ProductStatus` (PENDING_APPROVAL, APPROVED, REJECTED), `CouponDiscountType` (PERCENTAGE, FLAT), `OrderStatus` (PENDING, COMPLETED, CANCELLED), `AdCampaignStatus` (PENDING_APPROVAL, APPROVED, REJECTED).
- **Models:**
  - `User`: Global user entity mapping accounts to `Vendor`, `Order`, `Review`, `SavedCard`, and `Cart`.
  - `Vendor`: Merchant store information including name, logo, trust flag (`autoApproveProducts`), and approval status.
  - `Category`: Globally managed product categorization.
  - `Product`: Store inventory items containing pricing, image routes, and moderation status.
  - `Cart` & `CartItem`: Scoped shopping carts mapped to buyers.
  - `Order` & `OrderItem`: Financial transaction records featuring a PostgreSQL auto-incrementing `order_number` and UUID keys.
  - `Coupon`: Vendor promotional codes.
  - `SavedCard`: Secure card token vault.
  - `Review`: Aggregated ratings.
  - `AdCampaign` & `AdPricingSettings`: Core logic for managing and pricing banner advertisement carousel positions.
  - `PlatformSettings`: System-wide fields including default platform commission rates (e.g. 10%).

---

## ⚡ Commands Reference (Building, Running & Testing)

### 📌 Root Workspace (Monorepo Root)
```bash
# Setup Husky Hooks
npm run prepare

# Run linting on both frontend and backend projects
npm run lint

# Build both frontend and backend for production
npm run build
```

### 🖥️ Backend (NestJS API)
From the root workspace, prefix commands with `--prefix backend` or execute them inside `backend/`:
```bash
# Install dependencies
npm install

# Start development live watch mode
npm run start:dev

# Start debug watch mode
npm run start:debug

# Compile production-ready NestJS bundles
npm run build

# Start production server
npm run start:prod

# Apply database migration and generate Prisma Client
npx prisma migrate dev
npx prisma generate

# Seed Database (Default User: admin@shopify.com / Password123)
npx prisma db seed

# Run Jest Unit Tests
npm run test

# Run End-To-End (E2E) Integration Tests
npm run test:e2e

# Run tests in watch mode
npm run test:watch

# Format codebase via Prettier
npm run format
```

### 🎨 Frontend (Nuxt 3 SPA)
From the root workspace, prefix commands with `--prefix frontend` or execute them inside `frontend/`:
```bash
# Install dependencies
npm install

# Start Nuxt 3 local development server
npm run dev

# Build the application for production deployment
npm run build

# Locally preview the production build
npm run preview

# Run ESLint rules check
npm run lint

# Validate TypeScript type compilation
npx vue-tsc --noEmit
```

---

## 📐 AI Implementation Guidelines & Quality Gates

When developing, refactoring, or extending this project, adhere strictly to the following standards:

### 1. Strict TypeScript Integrity
- **No `any` or `@ts-ignore` Allowed:** The usage of `any`, `@ts-ignore`, `@ts-expect-error`, or `eslint-disable` for type errors is **strictly prohibited** in all pages, components, services, and utilities.
- **E2E/Unit Exception:** You may bypass strict typing *only* inside automated test files (`*.spec.ts`, `*.e2e-spec.ts`) where mock test environments are explicitly set up.
- **Interfaces:** Define clear, robust types/interfaces for all payloads, stores, and API requests.

### 2. Component Decomposition
- **Single Responsibility:** Pages or components exceeding **100 lines** of code should be split into smaller, modular, highly cohesive, single-responsibility components.
- **Directory Layout:**
  - **Global/Reusable Components:** Place in `frontend/app/components/common/`.
  - **Page-Specific Components:** Place inside a subdirectory named after the page (e.g. `frontend/app/components/register/` for the Register page components).

### 3. Separation of Concerns (Composables for Business Logic)
- **UI Only:** Keep Vue component template files focused entirely on UI rendering.
- **Extraction:** Universally extract complex business logic, reactive form states, and API submissions into custom composables (e.g. `useLogin.ts` forLoginForm, `useRegister.ts` for RegisterForm, `useVendorProducts.ts` for Product catalog manipulation).

### 4. Localize-as-you-Build (i18n)
- **Enforced Languages:** English (`en`), Russian (`ru`), Uzbek (`uz`).
- **No Hardcoded Strings:** Do not write static strings inside any Vue templates. Always extract strings into the respective locale files (`frontend/app/locales/en.json`, `ru.json`, and `uz.json`).
- **Syntax:** Reference translations in templates utilizing the `$t('key')` helper.

### 5. Semantic Tailwind Color Tokens
- **Flawless Themes:** To guarantee fully compatible dark/light mode switches, **do not hardcode static colors** (like `bg-white`, `bg-slate-50`, `text-slate-900`, `border-slate-200`) inside components.
- **CSS Custom Properties:** Utilize the semantic Tailwind tokens defined in `frontend/tailwind.config.ts`, mapped to CSS custom variables inside `frontend/app/assets/css/main.css`:
  - `bg-appBg` (Main application background)
  - `bg-cardBg` (Card backgrounds)
  - `text-textPrimary` (Primary text color)
  - `text-textSecondary` (Secondary text color)
  - `text-textMuted` (Disabled/muted text)
  - `border-appBorder` (Border colors)
  - `bg-brand` / `hover:bg-brandHover` / `text-brandText` (Primary brand colors)

### 6. Cart & Checkouts validation
- Strictly validate that any incoming `product.vendorId` is identical to existing items in the user's active checkout session/cart. Throw a `400` status on failure.

---

## 🔄 Git Workflow & Incremental Commits

To maintain structured, clean pull requests, respect the following workflow:
1. **Logical Chunking:** Build, test, and lint one feature or step at a time.
2. **Quality Check:** Execute linter (`npm run lint`) and type-checking before committing. Ensure all warnings and errors are fixed in modified files.
3. **Commit & Review Protocol:** After completing each block, **stop and suggest a structured commit message** (following conventional commits, e.g. `feat(cart): add single-vendor validation logic`). Prompt the user to review and commit changes before writing code for subsequent tasks.
