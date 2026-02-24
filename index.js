import express from "express";
import TelegramBot from "node-telegram-bot-api";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// توکن تلگرام
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN);

// پورت سرور
const PORT = process.env.PORT || 3000;

// کلید AvalAI و مدل
const AVAL_API_KEY = process.env.AVAL_API_KEY;
const MODEL = "gpt-4o";

// Webhook endpoint
app.post(`/bot${process.env.TELEGRAM_TOKEN}`, async (req, res) => {
  const msg = req.body.message;
  if (!msg || !msg.text) return res.sendStatus(200);

  try {
    // درخواست مستقیم به AvalAI
    const response = await fetch("https://api.avalai.ir/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${AVAL_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: msg.text }]
      })
    });

    // گرفتن JSON پاسخ
    const data = await response.json();

    // لاگ کامل پاسخ AvalAI (برای دیباگ)
    console.log("🔹 AvalAI Response:", JSON.stringify(data, null, 2));

    // استخراج متن پاسخ
    let reply = "❌ خطا: پاسخی دریافت نشد.";

    if (data.choices && data.choices[0]) {
      if (data.choices[0].message && data.choices[0].message.content) {
        reply = data.choices[0].message.content;
      } else if (data.choices[0].text) {
        reply = data.choices[0].text;
      } else if (data.response) {
        reply = data.response;
      }
    }

    // ارسال پاسخ به تلگرام
    await bot.sendMessage(msg.chat.id, reply);

  } catch (err) {
    console.log("خطا در ارتباط با AvalAI:", err);
    await bot.sendMessage(msg.chat.id, "❌ خطا در ارتباط با هوش مصنوعی. لطفاً بعداً امتحان کنید.");
  }

  res.sendStatus(200);
});

// راه‌اندازی سرور و Webhook
app.listen(PORT, async () => {
  const url = process.env.RENDER_EXTERNAL_URL;
  await bot.setWebHook(`${url}/bot${process.env.TELEGRAM_TOKEN}`);
  console.log("Bot is running with AvalAI GPT-4o via fetch 🚀");
});
