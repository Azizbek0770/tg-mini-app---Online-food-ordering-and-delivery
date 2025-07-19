import { storage } from "./storage";

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    // Create categories
    const categories = [
      {
        name: "Burgers",
        emoji: "🍔",
        slug: "burgers",
        description: "Delicious flame-grilled burgers",
        sortOrder: 1,
      },
      {
        name: "Shashlik",
        emoji: "🍖",
        slug: "shashlik",
        description: "Traditional grilled kebabs",
        sortOrder: 2,
      },
      {
        name: "Plov",
        emoji: "🍚",
        slug: "plov",
        description: "Authentic pilaf dishes",
        sortOrder: 3,
      },
      {
        name: "Drinks",
        emoji: "🥤",
        slug: "drinks", 
        description: "Refreshing beverages",
        sortOrder: 4,
      },
      {
        name: "Combos",
        emoji: "🍽️",
        slug: "combos",
        description: "Complete meal deals",
        sortOrder: 5,
      },
      {
        name: "Sides",
        emoji: "🍟",
        slug: "sides",
        description: "Tasty side dishes",
        sortOrder: 6,
      },
    ];

    console.log("📝 Creating categories...");
    const createdCategories = [];
    for (const category of categories) {
      const created = await storage.createCategory(category);
      createdCategories.push(created);
      console.log(`✓ Created category: ${category.name}`);
    }

    // Create menu items
    const menuItems = [
      // Burgers
      {
        name: "Durger King Classic",
        description: "Our signature beef burger with lettuce, tomato, onion, pickles, and special sauce",
        price: "8.99",
        categoryId: createdCategories.find(c => c.slug === "burgers")?.id,
        imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
        isPopular: true,
        preparationTime: 8,
        calories: 650,
        rating: "4.5",
        ratingCount: 127,
      },
      {
        name: "Cheese Royale",
        description: "Quarter pound beef patty with melted cheese, lettuce, and our royal sauce",
        price: "9.99",
        categoryId: createdCategories.find(c => c.slug === "burgers")?.id,
        imageUrl: "https://images.unsplash.com/photo-1553979459-d2229ba7433a?w=400",
        isPopular: true,
        preparationTime: 10,
        calories: 720,
        rating: "4.7",
        ratingCount: 89,
      },
      {
        name: "Chicken Supreme",
        description: "Crispy chicken breast with bacon, cheese, lettuce, and mayo",
        price: "7.99",
        categoryId: createdCategories.find(c => c.slug === "burgers")?.id,
        imageUrl: "https://images.unsplash.com/photo-1606755962773-d324e2d53401?w=400",
        preparationTime: 12,
        calories: 580,
        rating: "4.3",
        ratingCount: 156,
      },

      // Shashlik
      {
        name: "Beef Shashlik",
        description: "Tender grilled beef skewers marinated in traditional spices",
        price: "12.99",
        categoryId: createdCategories.find(c => c.slug === "shashlik")?.id,
        imageUrl: "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400",
        isPopular: true,
        preparationTime: 15,
        calories: 420,
        rating: "4.8",
        ratingCount: 92,
      },
      {
        name: "Lamb Shashlik",
        description: "Juicy lamb pieces grilled over open flame with herbs",
        price: "14.99",
        categoryId: createdCategories.find(c => c.slug === "shashlik")?.id,
        imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400",
        preparationTime: 18,
        calories: 480,
        rating: "4.9",
        ratingCount: 78,
      },
      {
        name: "Chicken Shashlik",
        description: "Marinated chicken breast skewers with vegetables",
        price: "10.99",
        categoryId: createdCategories.find(c => c.slug === "shashlik")?.id,
        imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400",
        preparationTime: 12,
        calories: 350,
        rating: "4.6",
        ratingCount: 134,
      },

      // Plov
      {
        name: "Uzbek Plov",
        description: "Traditional rice dish with lamb, carrots, and aromatic spices",
        price: "13.99",
        categoryId: createdCategories.find(c => c.slug === "plov")?.id,
        imageUrl: "https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=400",
        isPopular: true,
        preparationTime: 25,
        calories: 520,
        rating: "4.9",
        ratingCount: 156,
      },
      {
        name: "Chicken Plov",
        description: "Aromatic rice with tender chicken and traditional vegetables",
        price: "11.99",
        categoryId: createdCategories.find(c => c.slug === "plov")?.id,
        imageUrl: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400",
        preparationTime: 20,
        calories: 460,
        rating: "4.7",
        ratingCount: 89,
      },
      {
        name: "Vegetarian Plov",
        description: "Delicious rice with seasonal vegetables and dried fruits",
        price: "9.99",
        categoryId: createdCategories.find(c => c.slug === "plov")?.id,
        imageUrl: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400",
        preparationTime: 18,
        calories: 380,
        rating: "4.4",
        ratingCount: 67,
      },
      
      // Drinks
      {
        name: "Coca-Cola",
        description: "Classic refreshing cola drink",
        price: "2.49",
        categoryId: createdCategories.find(c => c.slug === "drinks")?.id,
        imageUrl: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400",
        preparationTime: 1,
        calories: 140,
        rating: "4.8",
        ratingCount: 203,
      },
      {
        name: "Orange Juice",
        description: "Fresh squeezed orange juice",
        price: "3.49",
        categoryId: createdCategories.find(c => c.slug === "drinks")?.id,
        imageUrl: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400",
        preparationTime: 2,
        calories: 110,
        rating: "4.6",
        ratingCount: 67,
      },
      {
        name: "Milkshake Vanilla",
        description: "Creamy vanilla milkshake topped with whipped cream",
        price: "4.99",
        categoryId: createdCategories.find(c => c.slug === "drinks")?.id,
        imageUrl: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400",
        isPopular: true,
        preparationTime: 3,
        calories: 320,
        rating: "4.9",
        ratingCount: 145,
      },

      // Combos
      {
        name: "Big Durger Combo",
        description: "Durger King Classic + Medium Fries + Medium Drink",
        price: "12.99",
        categoryId: createdCategories.find(c => c.slug === "combos")?.id,
        imageUrl: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400",
        isPopular: true,
        preparationTime: 10,
        calories: 950,
        rating: "4.8",
        ratingCount: 234,
      },
      {
        name: "Chicken Deluxe Combo",
        description: "Chicken Supreme + Large Fries + Large Drink + Cookie",
        price: "14.99",
        categoryId: createdCategories.find(c => c.slug === "combos")?.id,
        imageUrl: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400",
        preparationTime: 15,
        calories: 1180,
        rating: "4.6",
        ratingCount: 98,
      },

      // Sides
      {
        name: "French Fries",
        description: "Golden crispy french fries with sea salt",
        price: "3.99",
        categoryId: createdCategories.find(c => c.slug === "sides")?.id,
        imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400",
        isPopular: true,
        preparationTime: 4,
        calories: 365,
        rating: "4.4",
        ratingCount: 189,
      },
      {
        name: "Onion Rings",
        description: "Crispy golden onion rings with zesty dipping sauce",
        price: "4.49",
        categoryId: createdCategories.find(c => c.slug === "sides")?.id,
        imageUrl: "https://images.unsplash.com/photo-1639024471283-03518883512d?w=400",
        preparationTime: 6,
        calories: 410,
        rating: "4.2",
        ratingCount: 76,
      },
    ];

    console.log("🍔 Creating menu items...");
    for (const item of menuItems) {
      await storage.createMenuItem(item);
      console.log(`✓ Created menu item: ${item.name}`);
    }

    console.log("🎉 Database seeded successfully!");
    console.log(`✓ Created ${categories.length} categories`);
    console.log(`✓ Created ${menuItems.length} menu items`);

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log("✅ Seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Seeding failed:", error);
      process.exit(1);
    });
}

export { seedDatabase };