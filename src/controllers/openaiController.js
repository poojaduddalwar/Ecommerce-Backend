// controllers/openaiController.js
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🧠 Generate description from basic product info
export const generateProductDescription = async (req, res) => {
  const { name, features } = req.body;

  if (!name || !features || !Array.isArray(features)) {
    return res.status(400).json({ message: "Invalid name or features" });
  }

  const prompt = `Generate a compelling product description for a product named "${name}". The product has the following key features:\n${features.join(
    ", "
  )}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    res.status(200).json({ description: response.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ message: "Failed to generate description" });
  }
};

// 📦 Summarize a list of orders
export const summarizeOrders = async (req, res) => {
  const { orders } = req.body;

  if (!orders || !Array.isArray(orders)) {
    return res.status(400).json({ message: "Invalid orders" });
  }

  const orderSummary = orders
    .map((order, i) => {
      const items = order.items
        .map((item) => `${item.quantity}x ${item.productName}`)
        .join(", ");
      return `Order ${i + 1} by ${order.userEmail}: ${items}, total ₹${order.totalAmount}`;
    })
    .join("\n");

  const prompt = `Summarize the following order details into a brief report:\n${orderSummary}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    res.status(200).json({ summary: response.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ message: "Failed to summarize orders" });
  }
};
