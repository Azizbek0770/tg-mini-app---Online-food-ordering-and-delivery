import {
  users,
  categories,
  menuItems,
  orders,
  orderItems,
  staff,
  settings,
  type User,
  type UpsertUser,
  type Category,
  type InsertCategory,
  type MenuItem,
  type InsertMenuItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type Staff,
  type InsertStaff,
  type Setting,
  type InsertSetting,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, like, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: number): Promise<void>;
  
  // Menu item operations
  getMenuItems(categoryId?: number): Promise<(MenuItem & { category: Category | null })[]>;
  getMenuItemById(id: number): Promise<MenuItem | undefined>;
  createMenuItem(item: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: number, item: Partial<InsertMenuItem>): Promise<MenuItem>;
  deleteMenuItem(id: number): Promise<void>;
  
  // Order operations
  getOrders(status?: string): Promise<(Order & { user: User | null; items: (OrderItem & { menuItem: MenuItem | null })[] })[]>;
  getOrderById(id: number): Promise<(Order & { user: User | null; items: (OrderItem & { menuItem: MenuItem | null })[] }) | undefined>;
  getOrdersByUser(userId: string): Promise<Order[]>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order>;
  
  // Staff operations
  getStaff(): Promise<Staff[]>;
  getStaffById(id: number): Promise<Staff | undefined>;
  createStaff(staff: InsertStaff): Promise<Staff>;
  updateStaff(id: number, staff: Partial<InsertStaff>): Promise<Staff>;
  deleteStaff(id: number): Promise<void>;
  
  // Settings operations
  getSettings(): Promise<Setting[]>;
  getSetting(key: string): Promise<Setting | undefined>;
  upsertSetting(setting: InsertSetting): Promise<Setting>;
  
  // Dashboard stats
  getDashboardStats(): Promise<{
    todayOrders: number;
    todayRevenue: string;
    activeUsers: number;
    averageOrder: string;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return db.select().from(categories).where(eq(categories.isActive, true)).orderBy(categories.sortOrder, categories.name);
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category> {
    const [updatedCategory] = await db
      .update(categories)
      .set({ ...category, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<void> {
    await db.update(categories).set({ isActive: false }).where(eq(categories.id, id));
  }

  // Menu item operations
  async getMenuItems(categoryId?: number): Promise<(MenuItem & { category: Category | null })[]> {
    const baseQuery = db.select({
      id: menuItems.id,
      name: menuItems.name,
      description: menuItems.description,
      price: menuItems.price,
      categoryId: menuItems.categoryId,
      imageUrl: menuItems.imageUrl,
      isActive: menuItems.isActive,
      isPopular: menuItems.isPopular,
      preparationTime: menuItems.preparationTime,
      calories: menuItems.calories,
      rating: menuItems.rating,
      ratingCount: menuItems.ratingCount,
      sortOrder: menuItems.sortOrder,
      createdAt: menuItems.createdAt,
      updatedAt: menuItems.updatedAt,
      category: categories,
    })
    .from(menuItems)
    .leftJoin(categories, eq(menuItems.categoryId, categories.id))
    .orderBy(menuItems.sortOrder, menuItems.name);

    if (categoryId) {
      return await baseQuery.where(and(eq(menuItems.isActive, true), eq(menuItems.categoryId, categoryId)));
    }

    return await baseQuery.where(eq(menuItems.isActive, true));
  }

  async getMenuItemById(id: number): Promise<MenuItem | undefined> {
    const [item] = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return item;
  }

  async createMenuItem(item: InsertMenuItem): Promise<MenuItem> {
    const [newItem] = await db.insert(menuItems).values(item).returning();
    return newItem;
  }

  async updateMenuItem(id: number, item: Partial<InsertMenuItem>): Promise<MenuItem> {
    const [updatedItem] = await db
      .update(menuItems)
      .set({ ...item, updatedAt: new Date() })
      .where(eq(menuItems.id, id))
      .returning();
    return updatedItem;
  }

  async deleteMenuItem(id: number): Promise<void> {
    await db.update(menuItems).set({ isActive: false }).where(eq(menuItems.id, id));
  }

  // Order operations
  async getOrders(status?: string): Promise<(Order & { user: User | null; items: (OrderItem & { menuItem: MenuItem | null })[] })[]> {
    const baseQuery = db.select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      userId: orders.userId,
      status: orders.status,
      subtotal: orders.subtotal,
      deliveryFee: orders.deliveryFee,
      total: orders.total,
      customerNotes: orders.customerNotes,
      telegramChatId: orders.telegramChatId,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
      user: users,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .orderBy(desc(orders.createdAt));

    const ordersResult = status 
      ? await baseQuery.where(eq(orders.status, status))
      : await baseQuery;

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      ordersResult.map(async (order) => {
        const items = await db.select({
          id: orderItems.id,
          orderId: orderItems.orderId,
          menuItemId: orderItems.menuItemId,
          quantity: orderItems.quantity,
          price: orderItems.price,
          specialInstructions: orderItems.specialInstructions,
          createdAt: orderItems.createdAt,
          menuItem: menuItems,
        })
        .from(orderItems)
        .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
        .where(eq(orderItems.orderId, order.id));

        return {
          ...order,
          items,
        };
      })
    );

    return ordersWithItems;
  }

  async getOrderById(id: number): Promise<(Order & { user: User | null; items: (OrderItem & { menuItem: MenuItem | null })[] }) | undefined> {
    const [order] = await db.select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      userId: orders.userId,
      status: orders.status,
      subtotal: orders.subtotal,
      deliveryFee: orders.deliveryFee,
      total: orders.total,
      customerNotes: orders.customerNotes,
      telegramChatId: orders.telegramChatId,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
      user: users,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .where(eq(orders.id, id));

    if (!order) return undefined;

    const items = await db.select({
      id: orderItems.id,
      orderId: orderItems.orderId,
      menuItemId: orderItems.menuItemId,
      quantity: orderItems.quantity,
      price: orderItems.price,
      specialInstructions: orderItems.specialInstructions,
      createdAt: orderItems.createdAt,
      menuItem: menuItems,
    })
    .from(orderItems)
    .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
    .where(eq(orderItems.orderId, order.id));

    return {
      ...order,
      items,
    };
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  }

  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    
    const orderItemsWithOrderId = items.map(item => ({
      ...item,
      orderId: newOrder.id,
    }));
    
    await db.insert(orderItems).values(orderItemsWithOrderId);
    
    return newOrder;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  // Staff operations
  async getStaff(): Promise<Staff[]> {
    return db.select().from(staff).where(eq(staff.isActive, true)).orderBy(staff.name);
  }

  async getStaffById(id: number): Promise<Staff | undefined> {
    const [staffMember] = await db.select().from(staff).where(eq(staff.id, id));
    return staffMember;
  }

  async createStaff(staffData: InsertStaff): Promise<Staff> {
    const [newStaff] = await db.insert(staff).values(staffData).returning();
    return newStaff;
  }

  async updateStaff(id: number, staffData: Partial<InsertStaff>): Promise<Staff> {
    const [updatedStaff] = await db
      .update(staff)
      .set({ ...staffData, updatedAt: new Date() })
      .where(eq(staff.id, id))
      .returning();
    return updatedStaff;
  }

  async deleteStaff(id: number): Promise<void> {
    await db.update(staff).set({ isActive: false }).where(eq(staff.id, id));
  }

  // Settings operations
  async getSettings(): Promise<Setting[]> {
    return db.select().from(settings).orderBy(settings.key);
  }

  async getSetting(key: string): Promise<Setting | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting;
  }

  async upsertSetting(setting: InsertSetting): Promise<Setting> {
    const [upsertedSetting] = await db
      .insert(settings)
      .values(setting)
      .onConflictDoUpdate({
        target: settings.key,
        set: {
          value: setting.value,
          type: setting.type,
          description: setting.description,
          updatedAt: new Date(),
        },
      })
      .returning();
    return upsertedSetting;
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{
    todayOrders: number;
    todayRevenue: string;
    activeUsers: number;
    averageOrder: string;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayStats] = await db.select({
      todayOrders: sql<number>`count(*)::int`,
      todayRevenue: sql<string>`coalesce(sum(total), 0)::text`,
    })
    .from(orders)
    .where(sql`date(created_at) = date(${today.toISOString()})`);

    const [activeUsers] = await db.select({
      count: sql<number>`count(distinct user_id)::int`,
    })
    .from(orders)
    .where(sql`created_at >= ${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()}`);

    const [avgOrder] = await db.select({
      average: sql<string>`coalesce(avg(total), 0)::text`,
    })
    .from(orders)
    .where(sql`created_at >= ${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()}`);

    return {
      todayOrders: todayStats?.todayOrders || 0,
      todayRevenue: todayStats?.todayRevenue || "0",
      activeUsers: activeUsers?.count || 0,
      averageOrder: avgOrder?.average || "0",
    };
  }
}

export const storage = new DatabaseStorage();
