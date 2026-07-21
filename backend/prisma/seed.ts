import 'dotenv/config';
import {
  PrismaClient,
  Role,
  VendorStatus,
  ProductStatus,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// -----------------------------------------------------------------------------
// Mock Data definitions
// -----------------------------------------------------------------------------

interface ProductSeed {
  name: string;
  description: string;
  price: number;
  image: string;
}

interface VendorSeed {
  shopName: string;
  shopDescription: string;
  email: string;
  products: ProductSeed[];
}

interface CategorySeed {
  name: string;
  description: string;
  vendors: VendorSeed[];
}

const CATEGORIES_DATA: CategorySeed[] = [
  {
    name: 'Electronics',
    description: 'Smartphones, laptops, smartwatches, audio gear, and electronic accessories.',
    vendors: [
      {
        shopName: 'Apple Store',
        shopDescription: 'Official Apple retailer featuring the latest iPhones, MacBooks, and iPads.',
        email: 'apple@shopify.com',
        products: [
          {
            name: 'iPhone 15 Pro',
            description: 'The ultimate titanium iPhone with the A17 Pro chip and customized Action button.',
            price: 999.00,
            image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'MacBook Pro 16',
            description: 'Supercharged by M3 Pro or M3 Max. Liquid Retina XDR display and outstanding battery life.',
            price: 2499.00,
            image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'iPad Air',
            description: 'Featuring the Apple M1/M2 chip, 10.9-inch Liquid Retina display, and support for Apple Pencil.',
            price: 599.00,
            image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Apple Watch Ultra 2',
            description: 'The most rugged and capable Apple Watch, designed for endurance, exploration, and adventure.',
            price: 799.00,
            image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'AirPods Pro 2',
            description: 'Rebuilt for even richer audio. Next-level Active Noise Cancellation and Adaptive Audio.',
            price: 249.00,
            image: 'https://images.unsplash.com/photo-1588449668338-d15168822471?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'iMac 24-inch',
            description: 'The world’s best all-in-one desktop, now supercharged by the Apple M3 chip.',
            price: 1299.00,
            image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Mac Studio',
            description: 'Compact powerhouse for creators, equipped with M2 Max or M2 Ultra processors.',
            price: 1999.00,
            image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'iPad Pro',
            description: 'The ultimate iPad experience with standard-shattering Apple Silicon performance and OLED display.',
            price: 1099.00,
            image: 'https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'AirTag 4-Pack',
            description: 'Keep track of your keys, wallet, luggage, and more, all in the Find My app.',
            price: 99.00,
            image: 'https://images.unsplash.com/photo-1629131726617-4ecdedb9cc8b?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Apple TV 4K',
            description: 'Brings the best of TV together with your favorite Apple devices and services in 4K HDR.',
            price: 129.00,
            image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=500&q=80',
          },
        ],
      },
      {
        shopName: 'Samsung Store',
        shopDescription: 'Official Samsung retailer for premium Galaxy smartphones, tablets, and wearables.',
        email: 'samsung@shopify.com',
        products: [
          {
            name: 'Galaxy S24 Ultra',
            description: 'Premium AI-driven phone with built-in S Pen, 200MP camera, and titanium frame.',
            price: 1299.00,
            image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Galaxy Z Fold 5',
            description: 'The massive folding screen gives you a cinema-sized display and multi-window multitasking.',
            price: 1799.00,
            image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Galaxy Book 4 Pro',
            description: 'Ultra-thin, power-efficient laptop with an stunning 120Hz Dynamic AMOLED touchscreen.',
            price: 1499.00,
            image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Galaxy Tab S9',
            description: 'Durable IP68 water-resistant tablet with a powerful processor and beautiful 120Hz display.',
            price: 799.00,
            image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Galaxy Watch 6',
            description: 'Empower your wellness journey with advanced sleep coaching, body composition analysis, and heart tracking.',
            price: 299.00,
            image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Galaxy Buds 2 Pro',
            description: 'Studio-quality 24-bit Hi-Fi sound with intelligent active noise cancellation.',
            price: 229.00,
            image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Samsung Neo QLED TV',
            description: 'Magnificent 4K picture quality powered by quantum matrix technology and mini LEDs.',
            price: 1499.00,
            image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Smart Monitor M8',
            description: 'Stream, work, and chat on a sleek monitor that functions as an independent smart TV.',
            price: 699.00,
            image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Galaxy A55 5G',
            description: 'Awesome specs at an accessible price. High-res camera and durable glass design.',
            price: 449.00,
            image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Portable SSD T9 2TB',
            description: 'High-speed external solid state drive with rugged shock resistance and USB 3.2 Gen 2x2.',
            price: 189.00,
            image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=500&q=80',
          },
        ],
      },
      {
        shopName: 'Xiaomi Store',
        shopDescription: 'High quality electronics and smart home devices at highly competitive prices.',
        email: 'xiaomi@shopify.com',
        products: [
          {
            name: 'Xiaomi 14 Ultra',
            description: 'Co-engineered with Leica. Professional-grade quad-camera setup and peak Snapdragon performance.',
            price: 1099.00,
            image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Redmi Note 13 Pro',
            description: 'Featuring a 200MP camera with OIS, 1.5K 120Hz AMOLED display, and 67W turbo charging.',
            price: 349.00,
            image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Mi Pad 6',
            description: 'Perfect 11-inch 144Hz display for productivity or entertainment. Powered by Snapdragon 870.',
            price: 399.00,
            image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Xiaomi Watch S3',
            description: 'Interchangeable bezel design, 1.43-inch AMOLED display, and advanced health sensors.',
            price: 149.00,
            image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Redmi Buds 5 Pro',
            description: 'Coaxial dual drivers for deep bass and crisp treble, with ultra-wideband active noise cancellation.',
            price: 79.00,
            image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Mi Robot Vacuum S10',
            description: 'LDS laser navigation, powerful suction, and smart water tank control for dynamic cleaning.',
            price: 299.00,
            image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Mi Smart Band 8',
            description: 'The elegant fitness tracker with metallic bezel options, 150+ sports modes, and up to 16 days of battery.',
            price: 45.00,
            image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Xiaomi Electric Scooter 4',
            description: 'Commute with ease with up to 35km range, 25km/h top speed, and reliable dual brakes.',
            price: 499.00,
            image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Mi Portable Projector 2',
            description: 'Your portable home theater with smart auto-focus, Android TV, and crystal clear 1080p projection.',
            price: 549.00,
            image: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Mi Power Bank 50W',
            description: 'High capacity 20,000mAh external battery pack that supports laptop fast charging.',
            price: 39.00,
            image: 'https://images.unsplash.com/photo-1609592424109-dd08b4f0b07b?auto=format&fit=crop&w=500&q=80',
          },
        ],
      },
      {
        shopName: 'HP Store',
        shopDescription: 'Reliable HP laptops, premium monitors, printers, and essential computing accessories.',
        email: 'hp@shopify.com',
        products: [
          {
            name: 'HP Spectre x360',
            description: 'Beautiful 2-in-1 convertible laptop with OLED screen, Intel Core i7, and sleek gem-cut edges.',
            price: 1399.00,
            image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'HP Envy 16',
            description: 'Powerhouse laptop optimized for creative professionals, with dedicated RTX graphics.',
            price: 1199.00,
            image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'HP Pavilion 15',
            description: 'All-around reliable laptop for student life and office tasks with rich audio and thin bezel.',
            price: 699.00,
            image: 'https://images.unsplash.com/photo-1496181130204-755241544e35?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'HP Omen 16 Gaming',
            description: 'High performance gaming laptop with advanced cooling system and high refresh rate screen.',
            price: 1599.00,
            image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'HP EliteBook',
            description: 'Enterprise grade business laptop offering high security features and rugged reliability.',
            price: 1299.00,
            image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'HP LaserJet Pro',
            description: 'Fast, high-quality, and cost-efficient wireless monochrome laser printer for busy offices.',
            price: 299.00,
            image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'HP 27-inch 4K Monitor',
            description: 'Sleek IPS monitor with gorgeous 4K resolution, HDR support, and USB-C power delivery.',
            price: 349.00,
            image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'HP Ergonomic Keyboard',
            description: 'Split wave design keyboard with cushioned wrist rest for all-day typing comfort.',
            price: 59.00,
            image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'HP Wireless Mouse',
            description: 'Ergonomic, high-precision wireless mouse with programmable buttons and long battery life.',
            price: 29.00,
            image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'HP Reverb G2 VR Headset',
            description: 'State of the art virtual reality headset developed with Valve, offering stunning resolution and audio.',
            price: 599.00,
            image: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=500&q=80',
          },
        ],
      },
      {
        shopName: 'Hoco Store',
        shopDescription: 'High quality mobile accessories, premium chargers, durable cables, and portable audio gear.',
        email: 'hoco@shopify.com',
        products: [
          {
            name: 'Hoco W35 Headphones',
            description: 'Comfortable over-ear wireless headphones with deep bass and up to 40 hours of playtime.',
            price: 35.00,
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Hoco J101 Power Bank',
            description: 'Compact 10,000mAh external battery pack with fast-charging support and dual USB outputs.',
            price: 25.00,
            image: 'https://images.unsplash.com/photo-1609592424109-dd08b4f0b07b?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Hoco ES64 Sports Earphones',
            description: 'Lightweight neckband wireless earphones with magnetic earbuds and IPX5 sweat resistance.',
            price: 19.00,
            image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Hoco U112 Type-C Cable',
            description: 'Durable nylon-braided charging and data syncing cable with LED indicator and 100W PD.',
            price: 9.00,
            image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Hoco CA115 Car Mount',
            description: 'Safe and secure air vent phone holder with automatic clamping and 360-degree rotation.',
            price: 12.00,
            image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Hoco BS53 Speaker',
            description: 'Powerful outdoor Bluetooth speaker with dynamic RGB lighting and double microphone karaoke support.',
            price: 49.00,
            image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Hoco Y12 Smart Watch',
            description: 'Smartwatch featuring a vibrant touch screen, bluetooth calling, and basic fitness tracking.',
            price: 39.00,
            image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Hoco PH34 Desktop Stand',
            description: 'Sturdy, adjustable aluminum alloy holder stand for tablets and smartphones.',
            price: 15.00,
            image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Hoco Z48 Car Charger',
            description: 'Dual port fast car charger with metal housing and 45W Type-C Power Delivery.',
            price: 14.00,
            image: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Hoco M1 Pro Earphones',
            description: 'Classic in-ear wire headphones with mic, high-fidelity sound, and standard 3.5mm jack.',
            price: 8.00,
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80',
          },
        ],
      },
    ],
  },
  {
    name: 'Sports & Outdoors',
    description: 'A complete collection of sportswear, training footwear, gym equipment, and outdoor gear.',
    vendors: [
      {
        shopName: 'Nike Store',
        shopDescription: 'Official Nike outlet with elite running shoes, sportswear, and workout essentials.',
        email: 'nike@shopify.com',
        products: [
          {
            name: 'Nike Air Max',
            description: 'Iconic sneakers featuring visible Air cushioning for modern comfort and timeless style.',
            price: 149.00,
            image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Nike Pegasus 40',
            description: 'Springy, responsive neutral running shoe delivering comfort for daily road running.',
            price: 129.00,
            image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Nike Dri-FIT T-Shirt',
            description: 'Moisture-wicking athletic tee designed to keep you cool and dry during intense workouts.',
            price: 35.00,
            image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Nike Windrunner',
            description: 'Classic lightweight windbreaker jacket with signature chevron styling and mesh lining.',
            price: 99.00,
            image: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Nike Pro Leggings',
            description: 'Stretchy, high-waisted performance leggings made from durable synthetic fibers.',
            price: 55.00,
            image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Nike Gym Bag',
            description: 'Durable duffle bag featuring multiple pockets and separate compartment for dirty shoes.',
            price: 45.00,
            image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Nike Elite Basketball',
            description: 'Official size indoor/outdoor composite leather basketball with deep channels.',
            price: 39.00,
            image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Nike Vaporfly Running Shoes',
            description: 'Elite racing shoe built with carbon fiber plate and ZoomX foam for breaking records.',
            price: 259.00,
            image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Nike Mercurial Boots',
            description: 'Professional firm-ground football boots with textured upper for high speed control.',
            price: 199.00,
            image: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Nike Dry Sweatband',
            description: 'Absorbent double-knit elastic sweat headband for hair and perspiration control.',
            price: 12.00,
            image: 'https://images.unsplash.com/photo-1534215754734-18e55d13ce35?auto=format&fit=crop&w=500&q=80',
          },
        ],
      },
      {
        shopName: 'Adidas Store',
        shopDescription: 'Home of high performance Adidas running shoes, activewear, and lifestyle sneakers.',
        email: 'adidas@shopify.com',
        products: [
          {
            name: 'Adidas Ultraboost Light',
            description: 'Premium running shoe with responsive BOOST foam for infinite energy return.',
            price: 189.00,
            image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Adidas Stan Smith',
            description: 'Timeless clean white leather court sneakers with green heel tab and perforated stripes.',
            price: 95.00,
            image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Adidas Tiro Pants',
            description: 'Classic tapered soccer training track pants with zipper pockets and iconic three stripes.',
            price: 50.00,
            image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Adidas Essentials Hoodie',
            description: 'Comfortable fleece hoodie with Drawcord adjustable hood and kangaroo pocket.',
            price: 65.00,
            image: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Adidas Classic Backpack',
            description: 'Spacious backpack featuring padded straps and separate laptop protective compartment.',
            price: 40.00,
            image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Adidas Predator Boots',
            description: 'Engineered firm-ground soccer boots with rubber strike zone elements for precision spin.',
            price: 219.00,
            image: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Adidas Running Shorts',
            description: 'Lightweight, quick-drying training shorts with elastic waistband and inner key pocket.',
            price: 30.00,
            image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Adidas TPE Yoga Mat',
            description: 'Dual-textured non-slip yoga mat providing high traction and comfort cushioning.',
            price: 35.00,
            image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Adidas Superlite Cap',
            description: 'Breathable running cap with mesh panels and adjustable hook-and-loop closure.',
            price: 22.00,
            image: 'https://images.unsplash.com/photo-1534215754734-18e55d13ce35?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Adidas Adilette Slides',
            description: 'Classic poolside slides with quick dry contoured footbed and brand band.',
            price: 35.00,
            image: 'https://images.unsplash.com/photo-1534215754734-18e55d13ce35?auto=format&fit=crop&w=500&q=80',
          },
        ],
      },
      {
        shopName: 'Puma Store',
        shopDescription: 'Forever Faster. Suede sneakers, running shoes, tracksuits, and athletic gear.',
        email: 'puma@shopify.com',
        products: [
          {
            name: 'Puma Suede Classic',
            description: 'The defining street sneaker featuring soft suede, signature formstrip, and rubber outsole.',
            price: 75.00,
            image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Puma Velocity Nitro',
            description: 'All-distance running shoe with advanced NITRO FOAM technology for responsiveness.',
            price: 120.00,
            image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Puma Iconic T7 Jacket',
            description: 'Retro-inspired track jacket featuring signature athletic stripes on the sleeves.',
            price: 70.00,
            image: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Puma High-Impact Bra',
            description: 'Sports bra offering ultimate support and breathable cups for intensive routines.',
            price: 35.00,
            image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Puma Essential Shorts',
            description: 'Comfortable training shorts with side pockets and elastic waistband.',
            price: 28.00,
            image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Puma Challenger Duffle',
            description: 'Heavy duty sports duffle bag with multiple zipper compartments and carry handles.',
            price: 42.00,
            image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Puma Future Football',
            description: 'High performance size 5 training football with soft touch outer casing.',
            price: 30.00,
            image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Puma Smash Sneakers',
            description: 'Court-inspired leather low tops with clean stitching and durable cupsole.',
            price: 60.00,
            image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Puma dryCELL Training Tee',
            description: 'Advanced sweat-wicking lightweight training t-shirt with mesh back panels.',
            price: 25.00,
            image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Puma Cushioned Socks',
            description: 'Pack of 3 pairs of moisture control socks with ribbed ankle support.',
            price: 14.00,
            image: 'https://images.unsplash.com/photo-1534215754734-18e55d13ce35?auto=format&fit=crop&w=500&q=80',
          },
        ],
      },
      {
        shopName: 'Decathlon',
        shopDescription: 'Quality and affordable outdoor gear, sports equipment, camping accessories, and clothing.',
        email: 'decathlon@shopify.com',
        products: [
          {
            name: 'Quechua Camping Tent',
            description: 'Waterproof, easy-assembly 2-person dome tent. Perfect for weekend hiking trips.',
            price: 89.00,
            image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Kalenji Running Shoes',
            description: 'Affordable, flexible road running shoes designed for beginner runners.',
            price: 45.00,
            image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Tribord Life Jacket',
            description: 'High visibility, durable life jacket with quick-release buckles for boating.',
            price: 35.00,
            image: 'https://images.unsplash.com/photo-1475503572774-15a45e5d60b9?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Domyos Dumbbell Set 10kg',
            description: 'Adjustable cast iron hand weight set with solid threaded steel bars and spinlock collars.',
            price: 49.00,
            image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Nabaiji Swimming Goggles',
            description: 'Anti-fog swimming goggles with soft silicone gaskets and custom adjustable nose bridge.',
            price: 15.00,
            image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Btwin Mountain Bike',
            description: 'Rugged terrain multi-gear mountain bicycle with front suspension fork and reliable V-brakes.',
            price: 349.00,
            image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Kipsta Soccer Ball',
            description: 'Extremely durable laminated soccer training ball for regular grassroots play.',
            price: 18.00,
            image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Artengo Tennis Racket',
            description: 'Lightweight carbon composite tennis racket. Balanced frame for easy control.',
            price: 59.00,
            image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Forclaz Hiking Backpack 30L',
            description: 'Anatomical back frame backpack. Lightweight with integrated waterproof rain cover.',
            price: 39.00,
            image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Wedze Ski Goggles',
            description: 'Anti-fog and double lens snow goggles with 100% UV protection for skiing.',
            price: 34.00,
            image: 'https://images.unsplash.com/photo-1534215754734-18e55d13ce35?auto=format&fit=crop&w=500&q=80',
          },
        ],
      },
      {
        shopName: 'Under Armour',
        shopDescription: 'Innovative Under Armour athletic compression apparel, shoes, and training accessories.',
        email: 'underarmour@shopify.com',
        products: [
          {
            name: 'UA Curry 11 Basketball',
            description: 'Elite signature court shoe with revolutionary UA Flow cushioning for maximum grip.',
            price: 160.00,
            image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'UA Tech Graphic Tee',
            description: 'Loose, ultra-soft workout t-shirt engineered from quick dry performance fabric.',
            price: 29.00,
            image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'UA HeatGear Leggings',
            description: 'Compression fit base layer leggings offering ultra-lightweight muscle support.',
            price: 45.00,
            image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'UA Hustle Backpack',
            description: 'Water-resistant, heavy duty backpack with soft sleeve protection for laptops up to 15".',
            price: 55.00,
            image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'UA Hovr Sonic Running',
            description: 'Cushioned daily running shoe that connects to UA MapMyRun for real-time tracking.',
            price: 110.00,
            image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'UA Storm Cyclone Jacket',
            description: 'Highly breathable shell jacket repelling water without sacrificing airflow.',
            price: 120.00,
            image: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'UA Performance Sports Mask',
            description: 'Breathable structural athletic face mask with anti-microbial inside treatment.',
            price: 19.00,
            image: 'https://images.unsplash.com/photo-1534215754734-18e55d13ce35?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'UA Tech Compression Shorts',
            description: 'High performance ergonomic athletic compression undershorts.',
            price: 25.00,
            image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'UA Insulated Water Bottle',
            description: 'Double wall stainless steel vacuum insulated water bottle keeping liquids cold for 12 hours.',
            price: 22.00,
            image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'UA Weightlifting Gloves',
            description: 'Padded leather gym training gloves with wrist strap wraps for safety.',
            price: 25.00,
            image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=500&q=80',
          },
        ],
      },
    ],
  },
  {
    name: 'Clothing & Fashion',
    description: 'High street clothing, essential apparel, premium denim, and luxury fashion accessories.',
    vendors: [
      {
        shopName: 'Zara',
        shopDescription: 'Fast fashion retailer offering stylish dresses, jackets, suits, and daily wear.',
        email: 'zara@shopify.com',
        products: [
          {
            name: 'Double-Breasted Blazer',
            description: 'Structured tailoring with dynamic metal buttons and peak lapels.',
            price: 119.00,
            image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Linen Button-Up Shirt',
            description: 'Breathable, relaxed summer shirt tailored from organic linen.',
            price: 49.00,
            image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Slim Fit Dark Jeans',
            description: 'Classic stretch cotton denim trousers with minimal detailing.',
            price: 59.00,
            image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Faux Leather Biker Jacket',
            description: 'Edgy classic leather jacket with silver zipper hardware.',
            price: 149.00,
            image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Pleated Midi Skirt',
            description: 'Flowy, high-waisted pleated midi skirt with an elastic waistband.',
            price: 69.00,
            image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Knit Ribbed Sweater',
            description: 'Cozy wool-blend crewneck sweater with ribbed cuffs and hem.',
            price: 59.00,
            image: 'https://images.unsplash.com/photo-1574164904299-3a102b110380?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Leather Ankle Boots',
            description: 'Sleek leather pointed-toe boots with comfortable block heel.',
            price: 99.00,
            image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Leather Crossbody Bag',
            description: 'Compact daily purse with golden chain adjustable shoulder strap.',
            price: 45.00,
            image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Classic Belted Trench Coat',
            description: 'Waterproof double-breasted trench coat with smart waist belt.',
            price: 169.00,
            image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Aviator Sunglasses',
            description: 'Retro gold-tone metal aviators with UV protective dark lenses.',
            price: 29.00,
            image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=500&q=80',
          },
        ],
      },
      {
        shopName: 'H&M',
        shopDescription: 'Affordable fashion staples, comfy loungewear, and daily casual essentials.',
        email: 'hm@shopify.com',
        products: [
          {
            name: 'Oversized Cotton Hoodie',
            description: 'Cozy, thick fleece-lined hoodie in a relaxed oversized fit.',
            price: 39.00,
            image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Regular Fit Tee',
            description: 'Soft organic cotton crewneck t-shirt. Ideal base layer for daily wear.',
            price: 12.00,
            image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Multi-pocket Cargo Pants',
            description: 'Robust cotton cargo trousers featuring deep side utility pockets.',
            price: 45.00,
            image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Vintage Denim Jacket',
            description: 'Washed-down casual blue denim jacket with flap chest pockets.',
            price: 49.00,
            image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Floral Summer Dress',
            description: 'Lightweight, floral-patterned A-line dress with thin adjustable straps.',
            price: 34.00,
            image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'V-Neck Wool Cardigan',
            description: 'Soft-knit cardigan with rib-knit V-neck and button closure.',
            price: 29.00,
            image: 'https://images.unsplash.com/photo-1574164904299-3a102b110380?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Faux Suede Chelsea Boots',
            description: 'Classic elastic-side ankle boots with pull-tabs and durable rubber sole.',
            price: 59.00,
            image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Ribbed Knit Beanie',
            description: 'Warm, soft double-folded cuff winter hat.',
            price: 9.00,
            image: 'https://images.unsplash.com/photo-1576871337622-98d48d4353d3?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Patterned Swim Shorts',
            description: 'Quick-dry swim shorts with side pockets and inner mesh liner.',
            price: 19.00,
            image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Linen-Blend Trousers',
            description: 'Lightweight linen trousers featuring drawcord waistband.',
            price: 39.00,
            image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80',
          },
        ],
      },
      {
        shopName: 'Uniqlo',
        shopDescription: 'High quality LifeWear clothing. Warm Heattech, breathable AIRism, and light downs.',
        email: 'uniqlo@shopify.com',
        products: [
          {
            name: 'Ultra Light Down Jacket',
            description: 'Premium light-down insulation coat that easily packs into an included pocket pouch.',
            price: 89.00,
            image: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'AIRism Cotton Tee',
            description: 'Clean structured crewneck t-shirt with silk-smooth cool AIRism lining.',
            price: 19.00,
            image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Heattech Long Sleeve',
            description: 'Advanced heat-generating base layer undershirt for cold weather protection.',
            price: 24.00,
            image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Selvedge Slim Fit Jeans',
            description: 'Genuine selvedge stretch-cotton denim, offering authentic details and fit.',
            price: 59.00,
            image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Merino Wool Sweater',
            description: 'Fine-knit 100% merino wool sweater with high gloss and smooth texture.',
            price: 49.00,
            image: 'https://images.unsplash.com/photo-1574164904299-3a102b110380?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Linen Casual Shirt',
            description: 'Cool long-sleeve button-up tailored from high quality European flax.',
            price: 39.00,
            image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Easy Chino Shorts',
            description: 'Classic durable cotton chino utility shorts featuring stretch comfort.',
            price: 29.00,
            image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Blocktech Windproof Parka',
            description: 'Waterproof, windproof, and breathable high performance outdoor sports shell jacket.',
            price: 99.00,
            image: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Flannel Plaid Shirt',
            description: 'Soft brushed cotton flannel check shirt with dual flap chest pockets.',
            price: 39.00,
            image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Fleece Full-Zip Jacket',
            description: 'Thick pile fuzzy warm fleece jacket with full front metal zipper.',
            price: 49.00,
            image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=500&q=80',
          },
        ],
      },
      {
        shopName: "Levi's",
        shopDescription: 'Timeless Levi Strauss & Co. denim. Authentic 501 jeans, denim jackets, and shirts.',
        email: 'levis@shopify.com',
        products: [
          {
            name: '501 Original Fit Jeans',
            description: 'The worldwide benchmark for casual wear. Straight leg fit with signature button fly.',
            price: 89.00,
            image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Sherpa Trucker Jacket',
            description: 'Classic heavy denim trucker jacket lined with thick fuzzy warm faux sherpa.',
            price: 108.00,
            image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Housemark Graphic Tee',
            description: 'Soft jersey cotton t-shirt featuring Levi’s signature red batwing chest logo.',
            price: 29.00,
            image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Barstow Denim Western',
            description: 'Authentic denim long-sleeve western shirt with snap buttons and curved yoke.',
            price: 69.00,
            image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: '511 Slim Fit Jeans',
            description: 'Modern slim fit jeans with room to move. Stretch denim for all-day comfort.',
            price: 89.00,
            image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Classic Leather Belt',
            description: 'Handcrafted thick full-grain black leather belt with brushed metal buckle.',
            price: 39.00,
            image: 'https://images.unsplash.com/photo-1624222247344-550fb8ecf782?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Denim Icon Skirt',
            description: 'Mid-rise classic blue denim skirt with five-pocket design and button fly.',
            price: 69.00,
            image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Utility Cargo Trousers',
            description: 'Tough cotton twill cargo pants with reinforced knees and secure utility pockets.',
            price: 98.00,
            image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Denim Overalls Classic',
            description: 'Relaxed fit blue denim dungarees with adjustable shoulder straps and utility bib.',
            price: 128.00,
            image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Logo Pullover Hoodie',
            description: 'Thick brushed-fleece logo hoodie with rib-knit details and relaxed kangaroo pocket.',
            price: 59.00,
            image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=500&q=80',
          },
        ],
      },
      {
        shopName: 'Gucci',
        shopDescription: 'Exquisite Italian luxury. Designer bags, premium leather shoes, belts, and luxury fashion.',
        email: 'gucci@shopify.com',
        products: [
          {
            name: 'GG Leather Belt',
            description: 'Iconic black leather belt with signature gold-plated double-G hardware buckle.',
            price: 490.00,
            image: 'https://images.unsplash.com/photo-1624222247344-550fb8ecf782?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Ace Embroidered Sneaker',
            description: 'Premium white leather low-top designer sneakers with classic red/green web band and bee.',
            price: 850.00,
            image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'GG Marmont Shoulder Bag',
            description: 'Exquisite matelasse quilted chevron leather crossbody designer bag.',
            price: 2550.00,
            image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'GG Flora Silk Scarf',
            description: 'Beautifully printed 100% organic Italian twill silk neck scarf with floral print.',
            price: 495.00,
            image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'GG Oversized Sunglasses',
            description: 'Glamorous oversized acetate square sunglasses with gold brand detailing.',
            price: 420.00,
            image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Vintage Logo Tee',
            description: 'Casual luxury. Off-white cotton jersey t-shirt with classic Gucci retro print.',
            price: 590.00,
            image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'GG Supreme Canvas Jacket',
            description: 'Luxury hooded windproof canvas track jacket printed with all-over GG monogram.',
            price: 1980.00,
            image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Jordan Leather Loafers',
            description: 'Premium Italian black leather dress loafers adorned with iconic metal horsebit.',
            price: 920.00,
            image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'GG Supreme Wallet',
            description: 'Timeless bifold designer wallet crafted from durable coated canvas and fine leather.',
            price: 460.00,
            image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Wool Single-Breasted Coat',
            description: 'Elegant winter coat tailored from structured organic virgin wool.',
            price: 3500.00,
            image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=500&q=80',
          },
        ],
      },
    ],
  },
  {
    name: 'Home & Living',
    description: 'Beautiful furniture, smart organizing shelves, high-tech cleaning vacuums, and premium kitchenware.',
    vendors: [
      {
        shopName: 'IKEA',
        shopDescription: 'Well-designed, functional Scandinavian home furniture and accessories at affordable prices.',
        email: 'ikea@shopify.com',
        products: [
          {
            name: 'Billy Bookcase',
            description: 'The beloved standard book shelf. Versatile, modular design fits beautifully anywhere.',
            price: 79.00,
            image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Poäng Armchair',
            description: 'Comfortable layer-glued bent oak frame armchair with thick premium cushion.',
            price: 149.00,
            image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Kallax Shelf Unit',
            description: 'Sleek storage shelving cubes. Can be hung on walls or placed on floors.',
            price: 89.00,
            image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Lack Side Table',
            description: 'Sleek, lightweight side table. Extremely easy to assemble and clean.',
            price: 15.00,
            image: 'https://images.unsplash.com/photo-1581428982868-e410dd047a90?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Malm Bed Frame',
            description: 'Clean design and real wood veneer. High headboard makes sitting up comfy.',
            price: 299.00,
            image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Frakta Shopping Bag',
            description: 'The iconic durable, spacious blue multi-purpose utility storage bag.',
            price: 2.00,
            image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Stockholm Rug',
            description: 'Thick hand-woven flat wool checker rug, designed for durable comfort.',
            price: 249.00,
            image: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Ribba Photo Frame',
            description: 'Minimalist white composite wood frame with double mounting borders.',
            price: 12.00,
            image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'IKEA 365+ Container',
            description: 'Premium glass food prep storage container with secure airtight lock lid.',
            price: 6.00,
            image: 'https://images.unsplash.com/photo-1606168094326-f1b8c187515a?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Toftbo Bath Mat',
            description: 'Ultra soft absorbent microfiber bath rug mat that dries rapidly.',
            price: 9.00,
            image: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=500&q=80',
          },
        ],
      },
      {
        shopName: 'Dyson Store',
        shopDescription: 'State-of-the-art Dyson engineering. High suction cordless vacuums, fans, and hair stylers.',
        email: 'dyson@shopify.com',
        products: [
          {
            name: 'Dyson V15 Cordless Vacuum',
            description: 'Our most powerful cordless vacuum with smart laser dust illumination and deep cleaning.',
            price: 749.00,
            image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Dyson Purifier Cool Fan',
            description: 'Double duty HEPA glass air purifier and high speed cooling fan.',
            price: 649.00,
            image: 'https://images.unsplash.com/photo-1618944847828-82e943c3bedb?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Dyson Supersonic Hair Dryer',
            description: 'Ultra fast drying hair blower with intelligent heat control preventing heat damage.',
            price: 429.00,
            image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Dyson Airwrap Styler',
            description: 'Curl, wave, and smooth your hair utilizing the Coanda airflow effect without extreme heat.',
            price: 599.00,
            image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Dyson AM10 Humidifier',
            description: 'Hygienic smart humidifier killing 99.9% of bacteria for comfortable breathing environment.',
            price: 599.00,
            image: 'https://images.unsplash.com/photo-1618944847828-82e943c3bedb?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Dyson Hot+Cool Fan Heater',
            description: 'Fast, even room heating and powerful cooling fan all year round.',
            price: 499.00,
            image: 'https://images.unsplash.com/photo-1618944847828-82e943c3bedb?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Dyson Omni-glide Vacuum',
            description: 'Sleek, multi-directional cord-free vacuum specifically engineered for hard floors.',
            price: 449.00,
            image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Dyson Solarcycle Light',
            description: 'Task desk light that intelligently tracks local daylight, adjusting color and warmth.',
            price: 599.00,
            image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Dyson Corrale Straightener',
            description: 'The only straightener utilizing flexing manganese copper plates to style with half the damage.',
            price: 499.00,
            image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Dyson Big+Quiet Purifier',
            description: 'Heavy duty high volume HEPA air purifier for large open living rooms.',
            price: 849.00,
            image: 'https://images.unsplash.com/photo-1618944847828-82e943c3bedb?auto=format&fit=crop&w=500&q=80',
          },
        ],
      },
      {
        shopName: 'Philips Home',
        shopDescription: 'Reliable Philips home appliances, dynamic airfryers, smart lights, and personal care products.',
        email: 'philips@shopify.com',
        products: [
          {
            name: 'Airfryer XXL Premium',
            description: 'Cook delicious crispy meals with up to 90% less fat using fat removal technology.',
            price: 299.00,
            image: 'https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Sonicare Toothbrush',
            description: 'High speed sonic electric toothbrush providing superior teeth plaque removal.',
            price: 119.00,
            image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Hue Smart Bulb Kit',
            description: 'Starter smart lighting kit featuring three color-changing bulbs and smart hub bridge.',
            price: 129.00,
            image: 'https://images.unsplash.com/photo-1550985543-f47f38aeee65?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Automatic Espresso Maker',
            description: 'Dynamic bean-to-cup coffee machine preparing fresh espressos and cappuccinos.',
            price: 189.00,
            image: 'https://images.unsplash.com/photo-1517256064527-09c53b2d0ec6?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Handheld Garment Steamer',
            description: 'Compact vertical fabric clothing steamer. Removes wrinkles quickly and easily.',
            price: 79.00,
            image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Pasta & Noodle Maker',
            description: 'Add flour and water, and this machine automatically mixes, kneads, and extrudes fresh pasta.',
            price: 249.00,
            image: 'https://images.unsplash.com/photo-1606168094326-f1b8c187515a?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Somatic Wake-up Light',
            description: 'Clinically proven sunrise-simulation bedside light designed to wake you up refreshed.',
            price: 99.00,
            image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Multigroom Series Trimmer',
            description: 'Dual-cut all-in-one steel beard and hair trimmer styling tool kit.',
            price: 49.00,
            image: 'https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'PowerPro Compact Vacuum',
            description: 'Bagless cyclonic canister vacuum cleaner delivering high dust pickup suction.',
            price: 159.00,
            image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Philips Water Pitcher',
            description: 'Airtight water filtration jug reducing microplastics and chlorine.',
            price: 29.00,
            image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=500&q=80',
          },
        ],
      },
      {
        shopName: 'KitchenAid Store',
        shopDescription: 'Official KitchenAid. Beautiful heavy duty stand mixers, food processors, and premium baking tools.',
        email: 'kitchenaid@shopify.com',
        products: [
          {
            name: 'Artisan Stand Mixer',
            description: 'The iconic heavy duty 5-quart tilt-head kitchen stand mixer. Highly durable metal construction.',
            price: 449.00,
            image: 'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: '2-Slice Metal Toaster',
            description: 'Dual wide-slot toaster with electronic browning controls and crumb tray.',
            price: 99.00,
            image: 'https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: '9-Speed Hand Mixer',
            description: 'Professional handheld mixer with soft-start feature and digital speed control.',
            price: 109.00,
            image: 'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: '7-Cup Food Processor',
            description: 'Features a twist-free design, sealed bowl, and easy-to-clean blade attachments.',
            price: 129.00,
            image: 'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'KitchenAid K400 Blender',
            description: 'Quickly crushes ice and blends tough fiber ingredients with asymmetric metal blades.',
            price: 269.00,
            image: 'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: '1.25L Electric Kettle',
            description: 'Elegant retro dome-styled hot water tea kettle with stainless steel liner.',
            price: 89.00,
            image: 'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Slicer & Shredder Attachment',
            description: 'Plugs directly into your stand mixer’s power hub to slice fresh vegetables.',
            price: 69.00,
            image: 'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Drip 12-Cup Coffee Maker',
            description: 'Programmable drip coffee machine featuring spiral water showerhead for full extraction.',
            price: 119.00,
            image: 'https://images.unsplash.com/photo-1517256064527-09c53b2d0ec6?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Cordless Hand Blender',
            description: 'Lightweight cordless immersion blending stick with rechargeable lithium-ion battery.',
            price: 99.00,
            image: 'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Ceramic 5-Quart Mixing Bowl',
            description: 'Beautiful oven and microwave safe colored ceramic baking bowl.',
            price: 79.00,
            image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=500&q=80',
          },
        ],
      },
      {
        shopName: 'Tupperware Store',
        shopDescription: 'Genuine high quality Tupperware airtight containers, kitchen canisters, and food storage tools.',
        email: 'tupperware@shopify.com',
        products: [
          {
            name: 'Heritage Bowls 3-Piece Set',
            description: 'Classic stackable plastic storage bowls with secure airtight star burst seals.',
            price: 45.00,
            image: 'https://images.unsplash.com/photo-1606168094326-f1b8c187515a?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Eco Straw Bottle 4-Pack',
            description: 'Durable, reusable BPA-free personal water bottles with leakproof flip caps.',
            price: 35.00,
            image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Modular Mates Storage Set',
            description: 'Excellent stackable rectangle pantry canisters designed for dry foods.',
            price: 85.00,
            image: 'https://images.unsplash.com/photo-1606168094326-f1b8c187515a?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Chef Series Nonstick Pan',
            description: 'Hard-anodized aluminum frying skillet with durable PFOA-free nonstick surface.',
            price: 120.00,
            image: 'https://images.unsplash.com/photo-1606168094326-f1b8c187515a?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Quick Shake Mixer Cup',
            description: 'Internal blending wheel cup. Ideal for blending salad dressings or protein powders.',
            price: 15.00,
            image: 'https://images.unsplash.com/photo-1606168094326-f1b8c187515a?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Freezer Mates Containers',
            description: 'Specifically engineered low-temperature plastic boxes preventing freezer burn.',
            price: 39.00,
            image: 'https://images.unsplash.com/photo-1606168094326-f1b8c187515a?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Garlic & Onion Keeper',
            description: 'Provides ventilation and dark storage, extending freshness of garlic and onion bulbs.',
            price: 24.00,
            image: 'https://images.unsplash.com/photo-1606168094326-f1b8c187515a?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Insulated School Lunch Box',
            description: 'Includes secure insulated carry bag, leakproof sandwich box, and water tumbler.',
            price: 29.00,
            image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Ice Tup Popsicle Molds',
            description: 'Pack of six plastic freeze molds for making homemade fruit ice pops.',
            price: 12.00,
            image: 'https://images.unsplash.com/photo-1606168094326-f1b8c187515a?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Crystalwave Microwave Bowl',
            description: 'Microwave reheating bowl equipped with push vent lid for steam exhaust.',
            price: 18.00,
            image: 'https://images.unsplash.com/photo-1606168094326-f1b8c187515a?auto=format&fit=crop&w=500&q=80',
          },
        ],
      },
    ],
  },
  {
    name: 'Toys & Hobbies',
    description: 'Educational building blocks, classic board games, creative toys, and popular video game consoles.',
    vendors: [
      {
        shopName: 'Lego Store',
        shopDescription: 'Inspire and develop the builders of tomorrow with official Lego bricks and building sets.',
        email: 'lego@shopify.com',
        products: [
          {
            name: 'Star Wars Millennium Falcon',
            description: 'The ultimate collectors series model building set. Heavy detail and classic figurines.',
            price: 849.00,
            image: 'https://images.unsplash.com/photo-1585366119957-e5730b3d5825?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Hogwarts Castle',
            description: 'Build the legendary wizard school castle with Great Hall, classrooms, and towers.',
            price: 469.00,
            image: 'https://images.unsplash.com/photo-1585366119957-e5730b3d5825?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Technic Porsche 911 GT3',
            description: 'Engineered advanced replica model of Porsche sports car with moving engine pistons.',
            price: 179.00,
            image: 'https://images.unsplash.com/photo-1585366119957-e5730b3d5825?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Creator Expert Bonsai Tree',
            description: 'Mindful builder plant model displaying green leaves or pink cherry blossoms.',
            price: 49.00,
            image: 'https://images.unsplash.com/photo-1585366119957-e5730b3d5825?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Botanical Orchid Decor',
            description: 'Elegant home room decoration model. True-to-life white and pink orchids.',
            price: 49.00,
            image: 'https://images.unsplash.com/photo-1585366119957-e5730b3d5825?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Architecture Paris Skyline',
            description: 'Features Arc de Triomphe, Eiffel Tower, Louvre, and Notre Dame skyline display model.',
            price: 49.00,
            image: 'https://images.unsplash.com/photo-1585366119957-e5730b3d5825?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Marvel Avengers Tower',
            description: 'A massive 3-foot tower building set with multiple rooms and super hero action figures.',
            price: 499.00,
            image: 'https://images.unsplash.com/photo-1585366119957-e5730b3d5825?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'City Police Station',
            description: 'Fun, action-packed police station with jail cell, monitoring office, and police patrol car.',
            price: 69.00,
            image: 'https://images.unsplash.com/photo-1585366119957-e5730b3d5825?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Friends Heartlake City Mall',
            description: 'Vibrant, detailed doll-style shopping mall with clothing boutiques and food court.',
            price: 59.00,
            image: 'https://images.unsplash.com/photo-1585366119957-e5730b3d5825?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Classic Creative Bricks',
            description: 'Lego bricks in 33 different colors, windows, doors, and wheels for freeform building.',
            price: 34.00,
            image: 'https://images.unsplash.com/photo-1585366119957-e5730b3d5825?auto=format&fit=crop&w=500&q=80',
          },
        ],
      },
      {
        shopName: 'Hasbro Store',
        shopDescription: 'The home of classic board games, Nerf blasters, creative Play-Doh, and Action Figures.',
        email: 'hasbro@shopify.com',
        products: [
          {
            name: 'Monopoly Classic Game',
            description: 'The fast-dealing property trading board game. Buy, sell, and trade to win.',
            price: 22.00,
            image: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Jenga Classic Game',
            description: 'Stack the wooden block tower and pull them out one by one until the tower crashes.',
            price: 14.00,
            image: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Nerf Elite 2.0 Blaster',
            description: 'Rapid-fire foam dart toy gun equipped with 12 official foam darts and targeting sight.',
            price: 19.00,
            image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Play-Doh Super Starter Set',
            description: 'Includes 8 tubs of non-toxic modeling compound and sculpting tools.',
            price: 10.00,
            image: 'https://images.unsplash.com/photo-1515488042361-404e9250afef?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Transformers Optimus Prime',
            description: 'Authentic metallic transformer figure that converts from truck cab to autobot robot.',
            price: 29.00,
            image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'My Little Pony Mane Pony',
            description: 'Beautiful colorful plastic pony doll with hair comb accessory.',
            price: 12.00,
            image: 'https://images.unsplash.com/photo-1515488042361-404e9250afef?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Battleship Classic Game',
            description: 'The grid naval search-and-destroy strategy board game for two players.',
            price: 19.00,
            image: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Connect 4 Strategy Game',
            description: 'Classic disk-dropping grid game. Line up four color chips in a row to win.',
            price: 11.00,
            image: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Twister Body Game',
            description: 'Fun physical party game. Spin the spinner and place your hands and feet on colored dots.',
            price: 19.00,
            image: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Clue Detective Board Game',
            description: 'The mystery game where you solve a murder, search rooms, and find the killer.',
            price: 22.00,
            image: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=500&q=80',
          },
        ],
      },
      {
        shopName: 'Mattel Store',
        shopDescription: 'Official Mattel toy shop. Home of Barbie, Hot Wheels cars, UNO card games, and Fisher-Price.',
        email: 'mattel@shopify.com',
        products: [
          {
            name: 'Barbie Dreamhouse 3-Story',
            description: 'The ultimate dollhouse with sliding slide, pool, elevator, and fully furnished rooms.',
            price: 199.00,
            image: 'https://images.unsplash.com/photo-1515488042361-404e9250afef?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Hot Wheels 5-Car Pack',
            description: 'Assorted pack of 5 die-cast 1:64 scale classic high speed racing cars.',
            price: 7.00,
            image: 'https://images.unsplash.com/photo-1515488042361-404e9250afef?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Uno Card Game Classic',
            description: 'The matching color and number card game that’s easy to pick up, impossible to put down.',
            price: 6.00,
            image: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Fisher-Price Sorting Blocks',
            description: 'Toddler learning shape matching block bucket containing colorful bricks.',
            price: 12.00,
            image: 'https://images.unsplash.com/photo-1515488042361-404e9250afef?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Thomas & Friends Train',
            description: 'Battery powered motorized Thomas train engine for wooden railway tracks.',
            price: 18.00,
            image: 'https://images.unsplash.com/photo-1515488042361-404e9250afef?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Matchbox Collector Car',
            description: 'Exquisite 1:64 scale diecast utility vehicles with realistic functional moving doors.',
            price: 5.00,
            image: 'https://images.unsplash.com/photo-1515488042361-404e9250afef?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Scrabble Word Board Game',
            description: 'Classic word forming board game. Score points by interlocking letter tile crossword puzzles.',
            price: 19.00,
            image: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Polly Pocket Pocket World',
            description: 'Portable micro doll play set containing mini dolls and microscopic play accessories.',
            price: 15.00,
            image: 'https://images.unsplash.com/photo-1515488042361-404e9250afef?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Mega Bloks 80-Piece Bag',
            description: 'Award-winning giant building blocks for infants. Stored in handy storage bag.',
            price: 19.00,
            image: 'https://images.unsplash.com/photo-1515488042361-404e9250afef?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Pictionary Board Game',
            description: 'The sketch-and-guess drawing guessing party game. Draw clues to guess the words.',
            price: 19.00,
            image: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=500&q=80',
          },
        ],
      },
      {
        shopName: 'Nintendo Store',
        shopDescription: 'Official Nintendo. Home of Nintendo Switch, legendary games (Zelda, Mario), and controllers.',
        email: 'nintendo@shopify.com',
        products: [
          {
            name: 'Nintendo Switch OLED Model',
            description: 'Featuring a vibrant 7-inch OLED screen, wide adjustable stand, and wired LAN dock.',
            price: 349.00,
            image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Mario Kart 8 Deluxe',
            description: 'The ultimate kart racing game. Race your friends on dozens of tracks with fun items.',
            price: 59.00,
            image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Zelda Tears of the Kingdom',
            description: 'The massive epic open world adventure sequel on land and in the skies above Hyrule.',
            price: 69.00,
            image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Super Mario Odyssey',
            description: 'Explore massive 3D kingdoms alongside Mario and his shape-shifting companion Cappy.',
            price: 59.00,
            image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Super Smash Bros. Ultimate',
            description: 'The absolute gaming crossover fighter, starring every character in gaming history.',
            price: 59.00,
            image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Animal Crossing: New Horizons',
            description: 'Escape to a deserted island and craft your custom personal paradise home.',
            price: 59.00,
            image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Nintendo Switch Pro Controller',
            description: 'Comfortable premium controller with motion controls, HD rumble, and amiibo scanning.',
            price: 69.00,
            image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Joy-Con Controller Pair Neon',
            description: 'Standard multi-functional detachable motion controllers for Nintendo Switch.',
            price: 79.00,
            image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Pokémon Scarlet',
            description: 'Experience an open world Pokémon RPG, catching and battling creatures across Paldea.',
            price: 59.00,
            image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: "Luigi's Mansion 3",
            description: 'Luigi must vacuum up ghosts across towering haunted hotel floors to save Mario.',
            price: 59.00,
            image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=500&q=80',
          },
        ],
      },
      {
        shopName: 'PlayStation Store',
        shopDescription: 'Official Sony PlayStation games, PS5 consoles, and wireless DualSense controllers.',
        email: 'playstation@shopify.com',
        products: [
          {
            name: 'PlayStation 5 Console Slim',
            description: 'Experience lightning-fast loading, deeper immersion with haptic feedback, and 3D Audio.',
            price: 499.00,
            image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'DualSense Wireless Controller',
            description: 'Featuring immersive haptic feedback, dynamic adaptive triggers, and built-in microphone.',
            price: 69.00,
            image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: "Marvel's Spider-Man 2",
            description: 'Play as both Peter Parker and Miles Morales, swinging across Marvel’s expanded New York.',
            price: 69.00,
            image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'God of War Ragnarök',
            description: 'Join Kratos and Atreus on a mythical Norse journey across the Nine Realms.',
            price: 69.00,
            image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Gran Turismo 7',
            description: 'The real driving simulator. Race hundreds of real sports cars across legendary tracks.',
            price: 69.00,
            image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'PlayStation VR2 Headset',
            description: 'Escape into virtual reality worlds with stunning 4K HDR visuals and immersive tracking.',
            price: 549.00,
            image: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Pulse 3D Wireless Headset',
            description: 'Specifically fine-tuned to deliver the 3D Audio made possible by the PS5 console.',
            price: 99.00,
            image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'DualSense Charging Station',
            description: 'Click-in charging station to power up two DualSense wireless controllers simultaneously.',
            price: 29.00,
            image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'The Last of Us Part I',
            description: 'Experience the emotional storytelling and unforgettable characters of Joel and Ellie.',
            price: 69.00,
            image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=500&q=80',
          },
          {
            name: 'Horizon Forbidden West',
            description: 'Join Aloy as she braves the majestic but dangerous frontier of the Forbidden West.',
            price: 69.00,
            image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=500&q=80',
          },
        ],
      },
    ],
  },
];

// -----------------------------------------------------------------------------
// Seeding Execution Function
// -----------------------------------------------------------------------------

async function main() {
  console.log('🌱 Starting comprehensive database seeding...');

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

  // 3. Create Admin User (required by E2E tests and local administration)
  console.log('👥 Creating Admin user...');
  await prisma.user.create({
    data: {
      email: 'admin@shopify.com',
      password: commonPasswordHash,
      role: Role.ADMIN,
    },
  });

  // 4. Populate Categories, Vendors, and Products
  console.log('⚡ Populating Marketplace Categories, Vendors, and Products...');
  let totalCategories = 0;
  let totalVendors = 0;
  let totalProducts = 0;

  for (const categoryData of CATEGORIES_DATA) {
    // A. Create global category
    const category = await prisma.category.create({
      data: {
        name: categoryData.name,
        description: categoryData.description,
      },
    });
    totalCategories++;
    console.log(`📂 Created Category: "${category.name}"`);

    // B. Create vendors under this category
    for (const vendorData of categoryData.vendors) {
      // Create user login account for the vendor
      const vendorUser = await prisma.user.create({
        data: {
          email: vendorData.email,
          password: commonPasswordHash,
          role: Role.VENDOR,
        },
      });

      // Create vendor profile with autoApproveProducts = true (high trust status)
      const vendor = await prisma.vendor.create({
        data: {
          userId: vendorUser.id,
          shopName: vendorData.shopName,
          shopDescription: vendorData.shopDescription,
          autoApproveProducts: true,
          status: VendorStatus.APPROVED,
        },
      });
      totalVendors++;

      // C. Create products under this vendor & category
      for (const productData of vendorData.products) {
        await prisma.product.create({
          data: {
            vendorId: vendor.id,
            categoryId: category.id,
            name: productData.name,
            description: productData.description,
            price: productData.price,
            image: productData.image,
            status: ProductStatus.APPROVED, // instanly visible to buyers
          },
        });
        totalProducts++;
      }
      console.log(`   🏬 Created Vendor "${vendor.shopName}" with 10 products`);
    }
  }

  console.log('\n🎉 Seeding completed successfully!');
  console.log(`- Categories: ${totalCategories}`);
  console.log(`- Vendors:    ${totalVendors}`);
  console.log(`- Products:   ${totalProducts}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
