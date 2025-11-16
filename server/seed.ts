// server/seed.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/techmart';
const db = mongoose.connection.db!;
// Sample data
const users = [
  {
    email: "john.doe@email.com",
    password: "$2b$10$abcdefghijklmnopqrstuvwxyz", // Use bcrypt.hash in production
    firstName: "John",
    lastName: "Doe",
    role: "customer",
    phone: "+1-555-0123",
    addresses: [{
      street: "123 Main Street",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA",
      isDefault: true
    }],
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-10-01")
  },
  {
    email: "jane.smith@email.com",
    password: "$2b$10$abcdefghijklmnopqrstuvwxyz",
    firstName: "Jane",
    lastName: "Smith",
    role: "customer",
    phone: "+1-555-0124",
    addresses: [{
      street: "456 Oak Avenue",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90001",
      country: "USA",
      isDefault: true
    }],
    createdAt: new Date("2024-02-20"),
    updatedAt: new Date("2024-09-15")
  },
  {
    email: "admin@techmart.com",
    password: "$2b$10$abcdefghijklmnopqrstuvwxyz",
    firstName: "Admin",
    lastName: "User",
    role: "admin",
    phone: "+1-555-0100",
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2024-10-01")
  }
];

const categories = [
  {
    name: "Laptops",
    slug: "laptops",
    description: "High-performance laptops for work and gaming",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
    isActive: true,
    createdAt: new Date("2024-01-01")
  },
  {
    name: "Smartphones",
    slug: "smartphones",
    description: "Latest smartphones with cutting-edge technology",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
    isActive: true,
    createdAt: new Date("2024-01-01")
  },
  {
    name: "Headphones",
    slug: "headphones",
    description: "Premium audio equipment for music lovers",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
    isActive: true,
    createdAt: new Date("2024-01-01")
  },
  {
    name: "Smartwatches",
    slug: "smartwatches",
    description: "Fitness trackers and smartwatches",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
    isActive: true,
    createdAt: new Date("2024-01-01")
  },
  {
    name: "Cameras",
    slug: "cameras",
    description: "Professional cameras and photography equipment",
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f",
    isActive: true,
    createdAt: new Date("2024-01-01")
  },
  {
    name: "Spare Parts",
    slug: "spare-parts",
    description: "Replacement parts and accessories for devices",
    image: "https://images.unsplash.com/photo-1625948515291-69613efd103f",
    isActive: true,
    createdAt: new Date("2024-01-01")
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('📡 Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await mongoose.connection.db.dropDatabase();
    console.log('✅ Database cleared');

    // Get collections
    const db = mongoose.connection.db;
    
    // Insert users
    console.log('👥 Inserting users...');
    const usersResult = await db.collection('users').insertMany(users);
    const userIds = Object.values(usersResult.insertedIds);
    console.log(`✅ Inserted ${userIds.length} users`);

    // Insert categories
    console.log('📁 Inserting categories...');
    const categoriesResult = await db.collection('categories').insertMany(categories);
    const categoryIds = Object.values(categoriesResult.insertedIds);
    console.log(`✅ Inserted ${categoryIds.length} categories`);

    // Insert products
    console.log('📦 Inserting products...');
    const products = [
      {
        name: "MacBook Pro 16-inch M3",
        slug: "macbook-pro-16-m3",
        description: "Supercharged by M3 Pro or M3 Max chip. Up to 22 hours of battery life.",
        price: 2499.00,
        compareAtPrice: 2799.00,
        category: categoryIds[0], // Laptops
        images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8"],
        stock: 25,
        sku: "MBPRO-M3-16-256",
        brand: "Apple",
        specifications: {
          processor: "Apple M3 Max",
          ram: "36GB Unified Memory",
          storage: "512GB SSD",
          display: "16.2-inch Liquid Retina XDR"
        },
        rating: 4.8,
        reviewCount: 142,
        isActive: true,
        isFeatured: true,
        tags: ["premium", "professional", "apple"],
        createdAt: new Date("2024-03-15"),
        updatedAt: new Date("2024-10-01")
      },
      {
        name: "Dell XPS 15",
        slug: "dell-xps-15",
        description: "Powerful performance with stunning InfinityEdge display.",
        price: 1799.00,
        compareAtPrice: 1999.00,
        category: categoryIds[0], // Laptops
        images: ["https://images.unsplash.com/photo-1593642632823-8f785ba67e45"],
        stock: 18,
        sku: "DELL-XPS15-512",
        brand: "Dell",
        specifications: {
          processor: "Intel Core i7-13700H",
          ram: "16GB DDR5",
          storage: "512GB SSD",
          display: "15.6-inch FHD+"
        },
        rating: 4.6,
        reviewCount: 89,
        isActive: true,
        isFeatured: true,
        tags: ["performance", "creator"],
        createdAt: new Date("2024-04-20"),
        updatedAt: new Date("2024-09-28")
      },
      {
        name: "iPhone 15 Pro Max",
        slug: "iphone-15-pro-max",
        description: "Forged in titanium with an A17 Pro chip.",
        price: 1199.00,
        compareAtPrice: 1299.00,
        category: categoryIds[1], // Smartphones
        images: ["https://images.unsplash.com/photo-1695048133142-1a20484d2569"],
        stock: 45,
        sku: "IPHONE-15PM-256-BT",
        brand: "Apple",
        specifications: {
          processor: "A17 Pro chip",
          ram: "8GB",
          storage: "256GB",
          display: "6.7-inch Super Retina XDR"
        },
        rating: 4.9,
        reviewCount: 234,
        isActive: true,
        isFeatured: true,
        tags: ["flagship", "5g", "premium"],
        createdAt: new Date("2024-02-01"),
        updatedAt: new Date("2024-10-10")
      },
      {
        name: "Samsung Galaxy S24 Ultra",
        slug: "samsung-galaxy-s24-ultra",
        description: "Galaxy AI is here with stunning 200MP camera.",
        price: 1299.00,
        category: categoryIds[1], // Smartphones
        images: ["https://images.unsplash.com/photo-1610945415295-d9bbf067e59c"],
        stock: 38,
        sku: "SAMSUNG-S24U-512-BLK",
        brand: "Samsung",
        specifications: {
          processor: "Snapdragon 8 Gen 3",
          ram: "12GB",
          storage: "512GB",
          display: "6.8-inch Dynamic AMOLED 2X"
        },
        rating: 4.8,
        reviewCount: 178,
        isActive: true,
        isFeatured: true,
        tags: ["flagship", "5g", "android"],
        createdAt: new Date("2024-03-01"),
        updatedAt: new Date("2024-10-08")
      },
      {
        name: "Sony WH-1000XM5",
        slug: "sony-wh-1000xm5",
        description: "Industry-leading noise cancellation with 30-hour battery.",
        price: 399.00,
        compareAtPrice: 449.00,
        category: categoryIds[2], // Headphones
        images: ["https://images.unsplash.com/photo-1546435770-a3e426bf472b"],
        stock: 52,
        sku: "SONY-WH1000XM5-BLK",
        brand: "Sony",
        specifications: {
          type: "Over-ear",
          connectivity: "Bluetooth 5.2",
          batteryLife: "30 hours"
        },
        rating: 4.9,
        reviewCount: 312,
        isActive: true,
        isFeatured: true,
        tags: ["premium", "noise-cancelling", "wireless"],
        createdAt: new Date("2024-01-20"),
        updatedAt: new Date("2024-10-12")
      },
      {
        name: "AirPods Pro (2nd Gen)",
        slug: "airpods-pro-2nd-gen",
        description: "Active Noise Cancellation with USB-C charging.",
        price: 249.00,
        category: categoryIds[2], // Headphones
        images: ["https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7"],
        stock: 67,
        sku: "AIRPODS-PRO2-USBC",
        brand: "Apple",
        specifications: {
          type: "In-ear",
          connectivity: "Bluetooth 5.3",
          batteryLife: "6 hours (ANC on)"
        },
        rating: 4.8,
        reviewCount: 289,
        isActive: true,
        isFeatured: true,
        tags: ["wireless", "apple", "compact"],
        createdAt: new Date("2024-02-10"),
        updatedAt: new Date("2024-10-11")
      },
      {
        name: "Apple Watch Series 9",
        slug: "apple-watch-series-9",
        description: "Our most powerful chip yet with Double Tap feature.",
        price: 429.00,
        category: categoryIds[3], // Smartwatches
        images: ["https://images.unsplash.com/photo-1579586337278-3befd40fd17a"],
        stock: 41,
        sku: "AW-S9-45MM-GPS-BLK",
        brand: "Apple",
        specifications: {
          display: "45mm Always-On Retina",
          battery: "Up to 18 hours",
          features: "Double Tap, Blood Oxygen, ECG"
        },
        rating: 4.8,
        reviewCount: 203,
        isActive: true,
        isFeatured: true,
        tags: ["fitness", "health", "smartwatch"],
        createdAt: new Date("2024-04-05"),
        updatedAt: new Date("2024-10-14")
      },
      {
        name: "Canon EOS R6 Mark II",
        slug: "canon-eos-r6-mark-ii",
        description: "Professional full-frame mirrorless camera with 24.2MP sensor.",
        price: 2499.00,
        category: categoryIds[4], // Cameras
        images: ["https://images.unsplash.com/photo-1606983340126-99ab4feaa64a"],
        stock: 12,
        sku: "CANON-R6M2-BODY",
        brand: "Canon",
        specifications: {
          sensor: "24.2MP Full-Frame CMOS",
          video: "4K 60p, 6K RAW",
          autofocus: "Dual Pixel CMOS AF II"
        },
        rating: 4.9,
        reviewCount: 87,
        isActive: true,
        isFeatured: true,
        tags: ["professional", "mirrorless", "full-frame"],
        createdAt: new Date("2024-06-01"),
        updatedAt: new Date("2024-10-15")
      },
      // Spare Parts - Apple
      {
        name: "iPhone 15 Battery",
        slug: "iphone-15-battery",
        description: "OEM replacement battery for iPhone 15",
        price: 79.99,
        category: "Spare Parts",
        images: ["https://images.pexels.com/photos/4577818/pexels-photo-4577818.jpeg"],
        stock: 30,
        sku: "APPLE-BATTERY-IP15",
        brand: "Apple",
        rating: 4.7,
        reviewCount: 45,
        isActive: true,
        isFeatured: false,
        tags: ["spare parts", "battery"],
        createdAt: new Date("2024-08-01"),
        updatedAt: new Date("2024-10-15")
      },
      {
        name: "iPhone 15 Screen Display",
        slug: "iphone-15-screen",
        description: "Replacement OLED display for iPhone 15",
        price: 199.99,
        category: "Spare Parts",
        images: ["https://images.pexels.com/photos/8566555/pexels-photo-8566555.jpeg"],
        stock: 20,
        sku: "APPLE-SCREEN-IP15",
        brand: "Apple",
        rating: 4.8,
        reviewCount: 32,
        isActive: true,
        isFeatured: false,
        tags: ["spare parts", "display"],
        createdAt: new Date("2024-08-05"),
        updatedAt: new Date("2024-10-15")
      },
      // Spare Parts - Samsung
      {
        name: "Samsung Galaxy S24 Battery",
        slug: "samsung-s24-battery",
        description: "OEM replacement battery for Galaxy S24",
        price: 69.99,
        category: "Spare Parts",
        images: ["https://images.pexels.com/photos/4577818/pexels-photo-4577818.jpeg"],
        stock: 25,
        sku: "SAMSUNG-BATTERY-S24",
        brand: "Samsung",
        rating: 4.6,
        reviewCount: 28,
        isActive: true,
        isFeatured: false,
        tags: ["spare parts", "battery"],
        createdAt: new Date("2024-08-10"),
        updatedAt: new Date("2024-10-15")
      },
      {
        name: "Samsung Galaxy S24 Screen",
        slug: "samsung-s24-screen",
        description: "Replacement AMOLED display for Galaxy S24",
        price: 179.99,
        category: "Spare Parts",
        images: ["https://images.pexels.com/photos/8566555/pexels-photo-8566555.jpeg"],
        stock: 18,
        sku: "SAMSUNG-SCREEN-S24",
        brand: "Samsung",
        rating: 4.7,
        reviewCount: 35,
        isActive: true,
        isFeatured: false,
        tags: ["spare parts", "display"],
        createdAt: new Date("2024-08-15"),
        updatedAt: new Date("2024-10-15")
      },
      // Spare Parts - Dell
      {
        name: "Dell XPS 15 Battery",
        slug: "dell-xps-15-battery",
        description: "Replacement battery for Dell XPS 15",
        price: 129.99,
        category: "Spare Parts",
        images: ["https://images.pexels.com/photos/4577818/pexels-photo-4577818.jpeg"],
        stock: 15,
        sku: "DELL-BATTERY-XPS15",
        brand: "Dell",
        rating: 4.5,
        reviewCount: 22,
        isActive: true,
        isFeatured: false,
        tags: ["spare parts", "battery"],
        createdAt: new Date("2024-08-20"),
        updatedAt: new Date("2024-10-15")
      },
      {
        name: "Dell XPS 15 Keyboard",
        slug: "dell-xps-15-keyboard",
        description: "Replacement keyboard for Dell XPS 15",
        price: 89.99,
        category: "Spare Parts",
        images: ["https://images.pexels.com/photos/4576622/pexels-photo-4576622.jpeg"],
        stock: 22,
        sku: "DELL-KEYBOARD-XPS15",
        brand: "Dell",
        rating: 4.6,
        reviewCount: 18,
        isActive: true,
        isFeatured: false,
        tags: ["spare parts", "keyboard"],
        createdAt: new Date("2024-08-22"),
        updatedAt: new Date("2024-10-15")
      }
    ];

    const productsResult = await db.collection('products').insertMany(products);
    const productIds = Object.values(productsResult.insertedIds);
    console.log(`✅ Inserted ${productIds.length} products`);

    // Insert brands
    console.log('🏷️  Inserting brands...');
    const brands = [
      { brand_name: "Apple", category: "Smartphones", logo_url: "" },
      { brand_name: "Samsung", category: "Smartphones", logo_url: "" },
      { brand_name: "Xiaomi", category: "Smartphones", logo_url: "" },
      { brand_name: "Sony", category: "Headphones", logo_url: "" },
      { brand_name: "Apple", category: "Headphones", logo_url: "" },
      { brand_name: "Canon", category: "Cameras", logo_url: "" },
      { brand_name: "Dell", category: "Laptops", logo_url: "" },
      { brand_name: "Apple", category: "Smartwatches", logo_url: "" },
      // Spare Parts brands
      { brand_name: "Apple", category: "Spare Parts", logo_url: "" },
      { brand_name: "Samsung", category: "Spare Parts", logo_url: "" },
      { brand_name: "Dell", category: "Spare Parts", logo_url: "" }
    ];

    const brandsResult = await db.collection('brands').insertMany(brands);
    console.log(`✅ Inserted ${Object.keys(brandsResult.insertedIds).length} brands`);

    // Insert orders
    console.log('🛒 Inserting orders...');
    const orders = [
      {
        orderNumber: "ORD-2024-001",
        user: userIds[0],
        items: [
          {
            product: productIds[4], // Sony headphones
            name: "Sony WH-1000XM5",
            price: 399.00,
            quantity: 1,
            image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b"
          }
        ],
        subtotal: 399.00,
        tax: 35.91,
        shipping: 0.00,
        total: 434.91,
        status: "delivered",
        paymentMethod: "credit_card",
        paymentStatus: "paid",
        shippingAddress: {
          name: "John Doe",
          street: "123 Main Street",
          city: "New York",
          state: "NY",
          zipCode: "10001",
          country: "USA",
          phone: "+1-555-0123"
        },
        trackingNumber: "TRK123456789",
        createdAt: new Date("2024-09-15"),
        updatedAt: new Date("2024-09-22"),
        deliveredAt: new Date("2024-09-22")
      }
    ];

    const ordersResult = await db.collection('orders').insertMany(orders);
    console.log(`✅ Inserted ${Object.keys(ordersResult.insertedIds).length} orders`);

    // Insert reviews
    console.log('⭐ Inserting reviews...');
    const reviews = [
      {
        product: productIds[4],
        user: userIds[0],
        userName: "John Doe",
        rating: 5,
        title: "Best noise-cancelling headphones ever!",
        comment: "These headphones are absolutely incredible. The noise cancellation is better than my previous XM4s.",
        verified: true,
        helpful: 24,
        createdAt: new Date("2024-09-25"),
        updatedAt: new Date("2024-09-25")
      }
    ];

    const reviewsResult = await db.collection('reviews').insertMany(reviews);
    console.log(`✅ Inserted ${Object.keys(reviewsResult.insertedIds).length} reviews`);

    // Create indexes
    console.log('🔍 Creating indexes...');
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('products').createIndex({ slug: 1 }, { unique: true });
    await db.collection('categories').createIndex({ slug: 1 }, { unique: true });
    await db.collection('orders').createIndex({ orderNumber: 1 }, { unique: true });
    console.log('✅ Indexes created');

    console.log('\n🎉 Database seeded successfully!');
    console.log('📊 Summary:');
    console.log(`   - Users: ${userIds.length}`);
    console.log(`   - Categories: ${categoryIds.length}`);
    console.log(`   - Products: ${productIds.length}`);
    console.log(`   - Brands: ${Object.keys(brandsResult.insertedIds).length}`);
    console.log(`   - Orders: ${Object.keys(ordersResult.insertedIds).length}`);
    console.log(`   - Reviews: ${Object.keys(reviewsResult.insertedIds).length}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the seed function
seedDatabase();
