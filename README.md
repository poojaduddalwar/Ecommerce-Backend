Here’s a complete `README.md` file you can copy and paste into your GitHub repo for your **Ecommerce Backend** project:

---

```markdown
# 🛍️ Ecommerce Backend API

This is the backend for an e-commerce platform built with **Node.js**, **Express**, and **MongoDB**. It supports authentication, product management, categories, cart, order processing, Cashfree payment integration, and OpenAI-powered product descriptions and order summaries.

---

## 🚀 Features

- ✅ User Authentication (JWT)
- 🛒 Cart Management
- 📦 Order & Shipping Management
- 💳 Cashfree Payment Integration (with Webhook)
- 🤖 AI-Generated Product Descriptions (OpenAI GPT-4)
- 🧠 AI Order Summaries (OpenAI)
- 📂 Organized MVC Folder Structure
- 🌐 CORS, Helmet, Morgan for secure API access
- 📁 MongoDB Atlas-ready

---

## 🧱 Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT
- **Payments:** Cashfree
- **AI:** OpenAI GPT-4
- **Other Libraries:** dotenv, cors, helmet, morgan

---

## 📁 Project Structure

```

src/
├── controllers/
├── models/
├── routes/
├── services/
├── utils/
├── middlewares/
├── index.js

````

---

## 📦 Installation

1. **Clone the repo:**
   ```bash
   git clone https://github.com/poojaduddalwar/Ecommerce-Backend.git
````

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Environment variables:**

   Create a `.env` file in the root and add:

   ```env
   DB_URL = your_url
  PORT = 8080

  JWT_SECRET = your_token

  CF_APP_ID = your_id

  CF_SECRET_KEY = your_key

  OPENAI_API_KEY = your_key

   ```

---

## 🧪 Running the Server

```bash
npm run dev  # Starts server with nodemon
```

OR for production:

```bash
npm run build && npm start
```

---

## 🔌 API Endpoints

### 🔐 Auth

* `POST /api/v1/auth/register`
* `POST /api/v1/auth/login`

### 📦 Products

* `POST /api/v1/product/create`
* `GET /api/v1/product/`
* `PUT /api/v1/product/:id`
* `DELETE /api/v1/product/:id`

### 📁 Categories

* `POST /api/v1/category/create`
* `GET /api/v1/category/`

### 🛒 Cart

* `GET /api/v1/cart/`
* `POST /api/v1/cart/add`
* `POST /api/v1/cart/remove`

### 📦 Orders

* `POST /api/v1/order/webhook` – Handles webhook from Cashfree

### 💳 Payments

* `POST /api/v1/payment/create-order`

---

## 🧠 AI Features (OpenAI)

* **Product descriptions** generated automatically when a product is created.
* **Order summaries** are generated upon successful Cashfree payment via webhook.

---

## 🏁 Deployment

Deployed to:

* [Render](https://render.com/)

Make sure your environment variables are set in the deployment dashboard.

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

## 🙋‍♂️ Support

For any issues or questions, raise an issue or contact the maintainer.

```

---

Let me know if you'd like me to generate a version with custom badges, contributor sections, or Markdown anchors.
```
