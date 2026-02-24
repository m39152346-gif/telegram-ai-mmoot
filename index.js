import express from "express";
import TelegramBot from "node-telegram-bot-api";
import OpenAI from "openai";

const app = express();
app.use(express.json());

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const PORT = process.env.PORT || 3000;

app.post(`/bot${process.env.TELEGRAM_TOKEN}`, async (req, res) => {
  const msg = req.body.message;
  if (!msg || !msg.text) return res.sendStatus(200);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: msg.text }],
    });

    await bot.sendMessage(
      msg.chat.id,
      completion.choices[0].message.content
    );

  } catch (error) {
    console.log(error);
    await bot.sendMessage(msg.chat.id, "خطا رخ داد ❌");
  }

  res.sendStatus(200);
});

app.listen(PORT, async () => {
  const url = process.env.RENDER_EXTERNAL_URL;
  await bot.setWebHook(`${url}/bot${process.env.TELEGRAM_TOKEN}`);
  console.log("Bot is running with webhook");
});
