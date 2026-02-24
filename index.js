import express from "express";
import TelegramBot from "node-telegram-bot-api";
import OpenAI from "openai";

const app = express();
app.use(express.json());

// تلگرام
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN);

// AvalAI GPT‑4o
const openai = new OpenAI({
  apiKey: process.env.AVAL_API_KEY,          // کلید GPT‑4o
  baseURL: "https://api.avalai.ir/v1"        // مهم: آدرس AvalAI
});

const PORT = process.env.PORT || 3000;

// بررسی اولیه کلید AvalAI
if (!process.env.AVAL_API_KEY || process.env.AVAL_API_KEY.trim() === "") {
  console.error("⚠️ API Key AvalAI تنظیم نشده یا اشتباه است!");
}

// Webhook endpoint
app.post(`/bot${process.env.TELEGRAM_TOKEN}`, async (req, res) => {
  const msg = req.body.message;
  if (!msg || !msg.text) return res.sendStatus(200);

  try {
    // درخواست به GPT‑4o
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",  // مدل خودت
      messages: [{ role: "user", content: msg.text }],
    });

    // ارسال پاسخ به تلگرام
    await bot.sendMessage(
      msg.chat.id,
      completion.choices[0].message.content
    );

  } catch (error) {
    console.log("خطا در ارتباط با GPT‑4o:", error);
    await bot.sendMessage(msg.chat.id, "❌ خطا در ارتباط با هوش مصنوعی. لطفاً بعداً امتحان کنید.");
  }

  res.sendStatus(200);
});

// راه‌اندازی سرور و Webhook
app.listen(PORT, async () => {
  const url = process.env.RENDER_EXTERNAL_URL;
  await bot.setWebHook(`${url}/bot${process.env.TELEGRAM_TOKEN}`);
  console.log("Bot is running with AvalAI GPT-4o 🚀");
});
