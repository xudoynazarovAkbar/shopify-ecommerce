# 📌 Frontend Decomposition & Refactoring Plan

This document outlines the systematic plan for decomposing and refactoring frontend page and component files in accordance with the guidelines in **GEMINI.md**.

## 🛠️ Architectural Guidelines (from GEMINI.md)
1. **Component Decomposition:** Decompose page files over 100 lines into page-specific subcomponents in a dedicated subdirectory (e.g., `components/[page-name]/`) and global components in `components/common/`.
2. **Composables for Business Logic:** Keep SFC template files focused strictly on UI rendering by universally extracting complex business logic, reactive state (such as form inputs, loading flags), and API submission handlers into custom Vue composables.

---

## 🚨 Category 1: High-Priority Candidates (>300 lines)
These files are the most significant candidates for immediate refactoring due to their size and high density of mixed responsibilities.

### 1. `frontend/app/pages/vendor/campaigns.vue` (681 lines)
*   **Violations:**
    *   Mixes template layout with heavy business logic (state variables for creation/editing, file upload handlers, payment simulation).
    *   Defines multiple modal states (`isCheckoutOpen`, `isEditOpen`) and forms inside a single page-level file.
*   **Decomposition Strategy:**
    *   Extract business logic, file upload handlers, and API operations into a composable: `composables/useVendorCampaigns.ts`.
    *   Move the checkout simulation/modal into a component: `components/vendor/campaigns/CampaignCheckoutModal.vue`.
    *   Move the edit banner form into a component: `components/vendor/campaigns/CampaignEditModal.vue`.
    *   Move the booking/creation form into a component: `components/vendor/campaigns/CampaignBookingForm.vue`.

### 2. `frontend/app/pages/vendor/analytics.vue` (603 lines)
*   **Violations:**
    *   Mixes UI layouts, Chart.js components registration, date utilities (`formatDate`, `getInitialDates`), and data fetching for both Net Income and Product Sales metrics.
*   **Decomposition Strategy:**
    *   Extract analytical query logic, date calculations, and chart data formatting into: `composables/useVendorAnalytics.ts`.
    *   Extract the chart components and configurations into:
        *   `components/vendor/analytics/IncomeLineChart.vue`
        *   `components/vendor/analytics/ProductSalesChart.vue`
    *   Extract summary cards into a reusable layout or child components.

### 3. `frontend/app/pages/admin/revenue.vue` (482 lines)
*   **Violations:**
    *   Parallel issue to the vendor analytics page, combining massive Chart.js configurations, CSV exports, date range controls, and state management within a single page component.
*   **Decomposition Strategy:**
    *   Extract date processing, stats fetching, and CSV generation into: `composables/useAdminRevenue.ts`.
    *   Extract the platform-wide revenue charts into: `components/admin/revenue/RevenueLineChart.vue`.

### 4. `frontend/app/layouts/default.vue` (451 lines)
*   **Violations:**
    *   Extremely bloated layout file. It manages the entire main navigation header, multiple distinct navigation dropdowns (Buyer, Vendor, Admin), and footer structures inline.
*   **Decomposition Strategy:**
    *   Decompose the main navigation section into: `components/common/Navbar.vue` (or `components/common/Header.vue`).
    *   Extract the footer into: `components/common/Footer.vue`.
    *   Isolate role-specific navigation submenus into lightweight files (e.g., `components/common/VendorNavigation.vue`, `components/common/AdminNavigation.vue`).

### 5. `frontend/app/components/vendor/ProductFormModal.vue` (402 lines)
*   **Violations:**
    *   A component file that exceeds our 100-line threshold for simple files. This component embeds extensive validation rules, category lookups, file handling, and reactive structures.
*   **Decomposition Strategy:**
    *   Strictly separate UI from form controller by moving the state (rules, file parsing, form controls) to a composable: `composables/useProductForm.ts`.

### 6. `frontend/app/pages/buyer/spendings.vue` (344 lines)
*   **Violations:**
    *   Embeds analytics, interactive filters, table components, and chart representations.
*   **Decomposition Strategy:**
    *   Extract spending aggregation logic and chart generation to: `composables/useBuyerSpendings.ts`.
    *   Break down charts and spending lists into: `components/buyer/spendings/`.

### 7. `frontend/app/pages/admin/campaigns.vue` (306 lines)
*   **Violations:**
    *   Houses promotional list tables, pricing-settings configuration modals, and status approvals.
*   **Decomposition Strategy:**
    *   Extract pricing and campaign administration logic to: `composables/useAdminCampaigns.ts`.
    *   Isolate the pricing settings management into: `components/admin/campaigns/PricingSettingsModal.vue`.

---

## ⚠️ Category 2: Medium-Priority Candidates (150-300 lines)
These files should be refactored to maintain clean separation of concerns and avoid further compounding technical debt.

| File Path | Line Count | Current Concerns | Recommended Action |
| :--- | :--- | :--- | :--- |
| `frontend/app/pages/vendor/products.vue` | 237 lines | Mixed listing grids and bulk action UI | Move listing & filtering to a composable. |
| `frontend/app/components/cart/SavedCardSelector.vue` | 236 lines | Direct integration of vaulting forms and payment states | Extract cards list and form into separate items. |
| `frontend/app/pages/vendor/index.vue` | 223 lines | Direct integration of storefront forms and files | Extract to `composables/useVendorStorefront.ts`. |
| `frontend/app/pages/vendor/coupons.vue` | 221 lines | Mixed promo code actions and status lists | Separate into tables and filter states. |
| `frontend/app/components/search/SearchResultGrid.vue` | 219 lines | Grid rendering alongside complex search aggregations | Extract business queries to `useSearch.ts`. |
| `frontend/app/pages/admin/categories.vue` | 204 lines | Category tree listings and modal controllers | Separate table listing from form modals. |
| `frontend/app/components/vendor/CouponFormModal.vue` | 200 lines | Inline date conversions and validations | Move coupon schema and submit state to composable. |
| `frontend/app/components/vendors/ProductCatalog.vue` | 188 lines | Combines vendor storefront presentation with filtering | Decouple UI rendering from the pagination logic. |
| `frontend/app/pages/admin/vendors.vue` | 187 lines | Admin moderation and trust actions | Move the review queue logic to a composable. |
| `frontend/app/components/index/HeroBanner.vue` | 181 lines | Large slider markup and assets | Split slide subcomponents into global common assets. |
| `frontend/app/stores/cart.ts` | 177 lines | Massive state store managing checkout and promos | Refactor into lighter nested state actions. |
| `frontend/app/components/admin/CategoryFormModal.vue` | 170 lines | Form control and category hierarchy lookup | Move schema logic to parent composable. |
| `frontend/app/pages/vendor/orders.vue` | 164 lines | Order management with status workflows | Delegate action/state to `useVendorOrders.ts`. |
| `frontend/app/pages/admin/index.vue` | 159 lines | Aggregated metrics and system overview widgets | Group system widgets into specific components. |
| `frontend/app/pages/buyer/orders.vue` | 154 lines | Orders review workflow and list loops | Delegate table interactions to `useBuyerOrders.ts`. |
| `frontend/app/components/common/ConfirmationModal.vue` | 154 lines | Custom confirmation handlers | Move generic dialog definitions to an abstract utility. |
| `frontend/app/components/orders/ReviewFormModal.vue` | 153 lines | Core rating forms and feedback state | Extract rating controller to form composable. |
| `frontend/app/pages/cart.vue` | 145 lines | Single-vendor checking and total calculations | Move cart verification checks to `useCartCheckout.ts`. |
| `frontend/app/components/orders/OrderItemAccordion.vue` | 147 lines | Renders complex items and order statuses | Split status badge rendering into sub-template elements. |
| `frontend/app/components/cart/MoreFromVendor.vue` | 145 lines | Heavy template for cross-selling carousels | Split items loop from standard carousel controls. |
| `frontend/app/pages/admin/products.vue` | 141 lines | Table rows and approval actions | Decouple listing rendering from product mutations. |

---

## 📦 Backend Services Insight (For Context)
While NestJS services are allowed to contain complex orchestrations, some are starting to grow heavy:
*   `backend/src/campaigns/campaigns.service.ts` (**394 lines**)
*   `backend/src/stats/stats.service.ts` (**346 lines**)
*   `backend/src/products/products.service.ts` (**263 lines**)
*   `backend/src/orders/orders.service.ts` (**237 lines**)

*Recommendation:* For backend services crossing 250+ lines, isolate direct raw DB operations into targeted database query builders, or extract business rule checks into domain helpers/utility factories to keep NestJS services highly testable and focused.
