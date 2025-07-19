import { Bot, Context, session, SessionFlavor } from "grammy";
import { Menu } from "@grammyjs/menu";
import { storage } from "./storage";

interface SessionData {
  cartItems: Array<{
    id: number;
    name: string;
    price: string;
    quantity: number;
  }>;
  step?: string;
}

type MyContext = Context & SessionFlavor<SessionData>;

if (!process.env.TELEGRAM_BOT_TOKEN) {
  throw new Error("TELEGRAM_BOT_TOKEN environment variable is required");
}

const bot = new Bot<MyContext>(process.env.TELEGRAM_BOT_TOKEN);

// Session middleware
bot.use(session({
  initial: (): SessionData => ({ cartItems: [] }),
}));

// Create main menu
const getWebAppUrl = () => {
  if (process.env.REPLIT_DOMAINS) {
    return `https://${process.env.REPLIT_DOMAINS.split(',')[0]}/mini`;
  }
  return `https://localhost:5000/mini`;
};

const mainMenu = new Menu<MyContext>("main")
  .webApp("🍔 Order Food", getWebAppUrl())
  .row()
  .text("📋 My Orders", (ctx) => ctx.reply("Your recent orders will appear here"))
  .text("ℹ️ Help", (ctx) => ctx.reply("Welcome to Durger King! Use the 'Order Food' button to browse our menu and place orders."))
  .row()
  .text("📞 Contact", (ctx) => ctx.reply("Contact us at support@durgerking.com or call +1-555-BURGER"));

bot.use(mainMenu);

// Welcome message
bot.command("start", async (ctx) => {
  const userId = ctx.from?.id.toString();
  const username = ctx.from?.username;
  const firstName = ctx.from?.first_name;
  const lastName = ctx.from?.last_name;

  if (userId) {
    // Store/update user info in database
    try {
      await storage.upsertUser({
        id: userId,
        telegramUserId: userId,
        telegramUsername: username,
        firstName,
        lastName,
      });
    } catch (error) {
      console.error("Error storing user:", error);
    }
  }

  await ctx.reply(
    `🍔 Welcome to Durger King, ${firstName}!\n\n` +
    "I'm your personal food ordering assistant. Here's what I can help you with:\n\n" +
    "🍔 Order delicious burgers, sides, and drinks\n" +
    "📋 Track your order status\n" +
    "💬 Get help and support\n\n" +
    "Use the menu below to get started!",
    { reply_markup: mainMenu }
  );
});

// Handle menu commands
bot.command("menu", (ctx) => {
  ctx.reply("Choose an option:", { reply_markup: mainMenu });
});

// Handle order status
bot.command("orders", async (ctx) => {
  const userId = ctx.from?.id.toString();
  if (!userId) {
    return ctx.reply("Unable to identify user.");
  }

  try {
    const orders = await storage.getOrdersByUserId(userId);
    
    if (orders.length === 0) {
      return ctx.reply("You haven't placed any orders yet. Use the 'Order Food' button to start!");
    }

    let message = "📋 Your Recent Orders:\n\n";
    orders.slice(0, 5).forEach((order, index) => {
      const statusEmoji = getStatusEmoji(order.status);
      const statusText = getStatusText(order.status);
      message += `${statusEmoji} Order #${order.orderNumber}\n`;
      message += `   Status: ${statusText}\n`;
      message += `   Total: $${order.total}\n`;
      message += `   Date: ${order.createdAt?.toLocaleDateString()}\n\n`;
    });

    ctx.reply(message);
  } catch (error) {
    console.error("Error fetching orders:", error);
    ctx.reply("Sorry, I couldn't fetch your orders right now. Please try again later.");
  }
});

// Status helper functions
function getStatusEmoji(status: string): string {
  switch (status) {
    case 'pending': return '⏳';
    case 'confirmed': return '✅';
    case 'preparing': return '👨‍🍳';
    case 'ready': return '🍽️';
    case 'delivered': return '📦';
    case 'cancelled': return '❌';
    default: return '📋';
  }
}

function getStatusText(status: string): string {
  switch (status) {
    case 'pending': return 'Order Received';
    case 'confirmed': return 'Order Confirmed';
    case 'preparing': return 'Being Prepared';
    case 'ready': return 'Ready for Pickup';
    case 'delivered': return 'Delivered';
    case 'cancelled': return 'Cancelled';
    default: return status;
  }
}

// Order status update function
export async function sendOrderStatusUpdate(chatId: string, orderNumber: string, status: string) {
  try {
    const statusEmoji = getStatusEmoji(status);
    const statusText = getStatusText(status);
    
    let message = `${statusEmoji} Order Update!\n\n`;
    message += `Order #${orderNumber}\n`;
    message += `Status: ${statusText}\n\n`;
    
    if (status === 'confirmed') {
      message += '🍳 Your order has been confirmed and we\'re preparing it now!';
    } else if (status === 'preparing') {
      message += '👨‍🍳 Our chefs are preparing your delicious meal!';
    } else if (status === 'ready') {
      message += '🍽️ Your order is ready! Come pick it up or delivery is on the way!';
    } else if (status === 'delivered') {
      message += '📦 Your order has been delivered! Enjoy your meal!';
    }
    
    await bot.api.sendMessage(chatId, message);
  } catch (error) {
    console.error('Error sending status update:', error);
  }
}

// Handle Web App data
bot.on("message:web_app_data", async (ctx) => {
  try {
    const data = JSON.parse(ctx.message.web_app_data?.data || "{}");
    
    if (data.type === "order_placed") {
      const orderNumber = data.orderNumber;
      await ctx.reply(
        `🎉 Order confirmed!\n\n` +
        `Order #${orderNumber} has been placed successfully.\n` +
        `We'll notify you when your order is ready!\n\n` +
        `Estimated preparation time: 15-20 minutes`
      );
    }
  } catch (error) {
    console.error("Error processing web app data:", error);
  }
});

// Handle text messages
bot.on("message:text", (ctx) => {
  ctx.reply(
    "Hi! I'm the Durger King bot. Use the menu below to order food or get help.",
    { reply_markup: mainMenu }
  );
});

// Error handling
bot.catch((err) => {
  console.error("Bot error:", err);
});

export { bot };