import 'dotenv/config';
import {
  PrismaClient,
  Role,
  VendorStatus,
  ProductStatus,
  CouponDiscountType,
  OrderStatus,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clean existing records in reverse dependency order
  console.log('🧹 Clearing existing database records...');
  await prisma.review.deleteMany();
  await prisma.savedCard.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.user.deleteMany();

  // 2. Hash passwords
  console.log('🔐 Hashing default user passwords...');
  const saltRounds = 10;
  const commonPasswordHash = await bcrypt.hash('Password123', saltRounds);

  // 3. Create Users
  console.log('👥 Creating users (Admin, Vendors, Buyers)...');
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@shopify.com',
      password: commonPasswordHash,
      role: Role.ADMIN,
    },
  });

  const vendor1User = await prisma.user.create({
    data: {
      email: 'burger_palace@shopify.com',
      password: commonPasswordHash,
      role: Role.VENDOR,
    },
  });

  const vendor2User = await prisma.user.create({
    data: {
      email: 'gadget_world@shopify.com',
      password: commonPasswordHash,
      role: Role.VENDOR,
    },
  });

  const buyer1User = await prisma.user.create({
    data: {
      email: 'john_buyer@gmail.com',
      password: commonPasswordHash,
      role: Role.BUYER,
    },
  });

  const buyer2User = await prisma.user.create({
    data: {
      email: 'alice_buyer@gmail.com',
      password: commonPasswordHash,
      role: Role.BUYER,
    },
  });

  // 4. Create Vendors
  console.log('🏬 Creating vendor profiles...');
  const vendor1 = await prisma.vendor.create({
    data: {
      userId: vendor1User.id,
      shopName: 'Burger Palace',
      shopDescription: 'The finest gourmet burgers and hand-cut fries in town.',
      autoApproveProducts: true, // High trust merchant
      status: VendorStatus.APPROVED,
    },
  });

  const vendor2 = await prisma.vendor.create({
    data: {
      userId: vendor2User.id,
      shopName: 'Gadget World',
      shopDescription:
        'Your premium shop for latest electronics, smartphones, and accessories.',
      autoApproveProducts: false, // New or low-trust merchant
      status: VendorStatus.APPROVED,
    },
  });

  // 5. Create Categories
  console.log('🗂️ Creating global categories...');
  const categoryFood = await prisma.category.create({
    data: {
      name: 'Fast Food',
      description: 'Quick-service meals, snacks, and side dishes.',
    },
  });

  const categoryTech = await prisma.category.create({
    data: {
      name: 'Electronics',
      description: 'Smartphones, wearables, audio gear, and gadgets.',
    },
  });

  // 6. Create Products
  console.log('🍔 Creating products with conditional statuses...');
  // Burger Palace Products (Auto-approved because vendor.autoApproveProducts = true)
  const productBurger = await prisma.product.create({
    data: {
      vendorId: vendor1.id,
      categoryId: categoryFood.id,
      name: 'Double Cheese Burger',
      description:
        'Two flame-grilled beef patties, cheddar cheese, fresh lettuce, and house sauce.',
      price: 12.99,
      status: ProductStatus.APPROVED,
    },
  });

  const productFries = await prisma.product.create({
    data: {
      vendorId: vendor1.id,
      categoryId: categoryFood.id,
      name: 'Spicy Fries',
      description:
        'Crispy golden French fries tossed in our signature Cajun spice blend.',
      price: 4.5,
      status: ProductStatus.APPROVED,
    },
  });

  // Gadget World Products (Pending approval because vendor.autoApproveProducts = false)
  const productPhone = await prisma.product.create({
    data: {
      vendorId: vendor2.id,
      categoryId: categoryTech.id,
      name: 'Ultra Phone 15',
      description:
        'Next-gen smartphone with 120Hz AMOLED display and pro-grade triple camera system.',
      price: 999.0,
      status: ProductStatus.PENDING_APPROVAL,
    },
  });

  const productWatch = await prisma.product.create({
    data: {
      vendorId: vendor2.id,
      categoryId: categoryTech.id,
      name: 'Smart Watch V2',
      description:
        'Full-featured wellness watch with blood oxygen, heart-rate, and GPS tracking.',
      price: 199.0,
      status: ProductStatus.PENDING_APPROVAL,
    },
  });

  // Also create one manually APPROVED product for Gadget World so it is ready to buy
  const productEarbuds = await prisma.product.create({
    data: {
      vendorId: vendor2.id,
      categoryId: categoryTech.id,
      name: 'Wireless Earbuds X',
      description:
        'Active noise-cancelling earbuds with crystal clear sound and 30-hour battery life.',
      price: 89.99,
      status: ProductStatus.APPROVED,
    },
  });

  // 7. Create Coupons
  console.log('🎟️ Creating promotional coupons...');
  const couponBurger = await prisma.coupon.create({
    data: {
      vendorId: vendor1.id,
      code: 'BURGER20',
      discountType: CouponDiscountType.PERCENTAGE,
      discountValue: 20.0, // 20% off
    },
  });

  const couponGadget = await prisma.coupon.create({
    data: {
      vendorId: vendor2.id,
      code: 'GADGET50',
      discountType: CouponDiscountType.FLAT,
      discountValue: 50.0, // $50.00 off
    },
  });

  // 8. Create Saved Cards
  console.log('💳 Creating tokenized payment cards for buyers...');
  const card1 = await prisma.savedCard.create({
    data: {
      buyerId: buyer1User.id,
      cardToken: 'tok_visa_4242_simulated',
      brand: 'Visa',
      last4: '4242',
      expMonth: 12,
      expYear: 2028,
    },
  });

  const card2 = await prisma.savedCard.create({
    data: {
      buyerId: buyer2User.id,
      cardToken: 'tok_mastercard_5555_simulated',
      brand: 'Mastercard',
      last4: '5555',
      expMonth: 10,
      expYear: 2029,
    },
  });

  // 9. Create Active Cart with Scoped Single-Vendor rule
  console.log('🛒 Creating pre-loaded active cart for Buyer 1...');
  const buyer1Cart = await prisma.cart.create({
    data: {
      buyerId: buyer1User.id,
      vendorId: vendor1.id, // Cart is currently scoped strictly to "Burger Palace"
    },
  });

  await prisma.cartItem.create({
    data: {
      cartId: buyer1Cart.id,
      productId: productBurger.id,
      quantity: 1,
    },
  });

  await prisma.cartItem.create({
    data: {
      cartId: buyer1Cart.id,
      productId: productFries.id,
      quantity: 2,
    },
  });

  // 10. Create Historical Orders
  console.log(
    '📦 Seeding completed orders (Dual-Keyed Sequential Order Number)...',
  );
  // Order 1 from Buyer 2 to Burger Palace
  const order1 = await prisma.order.create({
    data: {
      buyerId: buyer2User.id,
      vendorId: vendor1.id,
      subtotal: 21.99,
      tax: 2.2,
      deliveryFee: 3.0,
      discount: 0.0,
      total: 27.19,
      status: OrderStatus.COMPLETED,
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order1.id,
      productId: productBurger.id,
      quantity: 1,
      price: 12.99,
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order1.id,
      productId: productFries.id,
      quantity: 2,
      price: 4.5,
    },
  });

  // 11. Create Review
  console.log('⭐ Creating shop review for Order 1...');
  await prisma.review.create({
    data: {
      orderId: order1.id,
      buyerId: buyer2User.id,
      vendorId: vendor1.id,
      rating: 5,
      comment:
        'Super fast delivery and the burger was incredible! Cajun fries are a must try.',
    },
  });

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
