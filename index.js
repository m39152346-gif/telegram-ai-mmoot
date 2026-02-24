import TelegramBot from "node-telegram-bot-api";
import OpenAI from "openai";

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, {
  polling: true,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

bot.on("message", async (msg) => {
  if (!msg.text) return;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: msg.text }],
    });

    bot.sendMessage(msg.chat.id, completion.choices[0].message.content);
  } catch (error) {
    bot.sendMessage(msg.chat.id, "خطا رخ داد ❌");
  }
});
