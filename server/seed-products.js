require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const initialProducts = [
  {
    name: 'Apple iPhone 16 Pro Max',
    description: 'The ultimate iPhone featuring a stunning titanium design, new camera control, and the powerful A18 Pro chip.',
    brand: 'Apple',
    category: 'Smartphones',
    price: 144900,
    stock: 45,
    discount: 5,
    status: 'ACTIVE',
    images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=500&auto=format&fit=crop']
  },
  {
    name: 'Samsung Galaxy S25 Ultra',
    description: 'Galaxy S25 Ultra redefines mobile power with Galaxy AI, a sleek titanium frame, and unmatched zoom camera performance.',
    brand: 'Samsung',
    category: 'Smartphones',
    price: 129999,
    stock: 20,
    discount: 0,
    status: 'ACTIVE',
    images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=500&auto=format&fit=crop']
  },
  {
    name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
    description: 'Industry-leading noise cancellation, exceptional sound quality, and crystal-clear hands-free calling.',
    brand: 'Sony',
    category: 'Headphones',
    price: 29990,
    stock: 120,
    discount: 15,
    status: 'ACTIVE',
    images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=500&auto=format&fit=crop']
  },
  {
    name: 'MacBook Pro M3 Max 16-inch',
    description: 'The most advanced Mac laptop ever created, packing professional performance and a gorgeous Liquid Retina XDR screen.',
    brand: 'Apple',
    category: 'Laptops',
    price: 349900,
    stock: 5,
    discount: 0,
    status: 'ACTIVE',
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=500&auto=format&fit=crop']
  },
  {
    name: 'Apple Watch Ultra 2',
    description: 'The rugged and capable watch built for athletes, adventurers, and outdoor explorers.',
    brand: 'Apple',
    category: 'Smart Watches',
    price: 89900,
    stock: 35,
    discount: 8,
    status: 'ACTIVE',
    images: ['https://images.unsplash.com/photo-1434493789847-2902641492d2?q=80&w=500&auto=format&fit=crop']
  },
  {
    name: 'Sony Alpha 7R V Mirrorless Camera',
    description: 'High-resolution mirrorless camera featuring a 61MP sensor, real-time autofocus powered by AI, and 8K video.',
    brand: 'Sony',
    category: 'Cameras',
    price: 334990,
    stock: 0,
    discount: 0,
    status: 'OUT_OF_STOCK',
    images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=500&auto=format&fit=crop']
  },
  {
    name: 'PlayStation 5 Console',
    description: 'Experience lightning-fast loading, deeper immersion with haptic feedback, and an all-new generation of incredible PlayStation games.',
    brand: 'Sony',
    category: 'Gaming',
    price: 49990,
    stock: 12,
    discount: 10,
    status: 'ACTIVE',
    images: ['https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=500&auto=format&fit=crop']
  },
  {
    name: 'iPad Pro 13-inch M4',
    description: 'Impossibly thin design, breakthrough Ultra Retina XDR display, and outrageous performance from the M4 chip.',
    brand: 'Apple',
    category: 'Tablets',
    price: 129900,
    stock: 50,
    discount: 0,
    status: 'ACTIVE',
    images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=500&auto=format&fit=crop']
  }
];

async function seed() {
  console.log('Seeding initial products into PostgreSQL...');
  for (const prod of initialProducts) {
    const existing = await prisma.product.findFirst({
      where: { name: prod.name }
    });

    if (!existing) {
      const created = await prisma.product.create({
        data: prod
      });
      console.log(`Created product: ${created.name} (${created.id})`);
    } else {
      console.log(`Product already exists: ${prod.name}`);
    }
  }
  console.log('Seeding completed successfully!');
}

seed()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
