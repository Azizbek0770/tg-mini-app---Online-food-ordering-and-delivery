import { storage } from "./storage";

async function addNewMenuItems() {
  try {
    console.log("🍽️ Adding new menu items...");

    // Get existing categories
    const categories = await storage.getCategories();
    const shashlikCategory = categories.find(c => c.slug === "shashlik") || await storage.createCategory({
      name: "Shashlik",
      emoji: "🍖",
      slug: "shashlik",
      description: "Traditional grilled kebabs",
      sortOrder: 2,
    });
    
    const plovCategory = categories.find(c => c.slug === "plov") || await storage.createCategory({
      name: "Plov",
      emoji: "🍚",
      slug: "plov",
      description: "Authentic pilaf dishes",
      sortOrder: 3,
    });

    // Check if items already exist
    const existingItems = await storage.getMenuItems();
    const existingNames = existingItems.map(item => item.name);

    const newItems = [
      // Shashlik items
      {
        name: "Beef Shashlik",
        description: "Tender grilled beef skewers marinated in traditional spices",
        price: "12.99",
        categoryId: shashlikCategory.id,
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
        categoryId: shashlikCategory.id,
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
        categoryId: shashlikCategory.id,
        imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400",
        preparationTime: 12,
        calories: 350,
        rating: "4.6",
        ratingCount: 134,
      },

      // Plov items
      {
        name: "Uzbek Plov",
        description: "Traditional rice dish with lamb, carrots, and aromatic spices",
        price: "13.99",
        categoryId: plovCategory.id,
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
        categoryId: plovCategory.id,
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
        categoryId: plovCategory.id,
        imageUrl: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400",
        preparationTime: 18,
        calories: 380,
        rating: "4.4",
        ratingCount: 67,
      },
    ];

    // Add only new items
    for (const item of newItems) {
      if (!existingNames.includes(item.name)) {
        await storage.createMenuItem(item);
        console.log(`✓ Added menu item: ${item.name}`);
      } else {
        console.log(`- ${item.name} already exists, skipping`);
      }
    }

    console.log("🎉 New menu items added successfully!");

  } catch (error) {
    console.error("❌ Error adding menu items:", error);
    throw error;
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  addNewMenuItems()
    .then(() => {
      console.log("✅ Items added successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Adding failed:", error);
      process.exit(1);
    });
}

export { addNewMenuItems };