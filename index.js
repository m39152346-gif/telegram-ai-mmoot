import express from "express";
import TelegramBot from "node-telegram-bot-api";
import OpenAI from "openai";

const app = express();
app.use(express.json());

// تلگرام
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN);

// AvalAI
const openai = new OpenAI({
  apiKey: process.env.AVAL_API_KEY,          // اینجا API AvalAI
  baseURL: "https://api.avalai.ir/v1"        // مهم: آدرس AvalAI
});

// پورت
const PORT = process.env.PORT || 3000;

// Webhook endpoint
app.post(`/bot${process.env.TELEGRAM_TOKEN}`, async (req, res) => {
  const msg = req.body.message;
  if (!msg || !msg.text) return res.sendStatus(200);

  try {
    // درخواست به AvalAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",                       // آخرین نسخه GPT AvalAI
      messages: [{ role: "user", content: msg.text }],
    });

    // ارسال پاسخ به تلگرام
    await bot.sendMessage(
      msg.chat.id,
      completion.choices[0].message.content
    );

  } catch (error) {
    console.log(error);                       // لاگ خطا
    await bot.sendMessage(msg.chat.id, "خطا در ارتباط با هوش مصنوعی ❌");
  }

  res.sendStatus(200);
});

// راه‌اندازی سرور و تنظیم Webhook
app.listen(PORT, async () => {
  const url = process.env.RENDER_EXTERNAL_URL;
  await bot.setWebHook(`${url}/bot${process.env.TELEGRAM_TOKEN}`);
  console.log("Bot is running with AvalAI GPT-5.2 🚀");
});
