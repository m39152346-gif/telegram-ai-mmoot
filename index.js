import express from "express";
import TelegramBot from "node-telegram-bot-api";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN);
const PORT = process.env.PORT || 3000;

const AVAL_API_KEY = process.env.AVAL_API_KEY;
const MODEL = "gpt-4o";

app.post(`/bot${process.env.TELEGRAM_TOKEN}`, async (req, res) => {
  const msg = req.body.message;
  if (!msg || !msg.text) return res.sendStatus(200);

  try {
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

    const data = await response.json();

    // بررسی پاسخ AvalAI با دو حالت
    let reply = "❌ خطا: پاسخی دریافت نشد.";

    if (data.choices && data.choices[0]) {
      if (data.choices[0].message && data.choices[0].message.content) {
        reply = data.choices[0].message.content;
      } else if (data.choices[0].text) {
        reply = data.choices[0].text;
      }
    }

    await bot.sendMessage(msg.chat.id, reply);

  } catch (err) {
    console.log("خطا در ارتباط با AvalAI:", err);
    await bot.sendMessage(msg.chat.id, "❌ خطا در ارتباط با هوش مصنوعی. لطفاً بعداً امتحان کنید.");
  }

  res.sendStatus(200);
});

app.listen(PORT, async () => {
  const url = process.env.RENDER_EXTERNAL_URL;
  await bot.setWebHook(`${url}/bot${process.env.TELEGRAM_TOKEN}`);
  console.log("Bot is running with AvalAI GPT-4o via fetch 🚀");
});
