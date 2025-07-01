import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
      price: { type: Number } // optional but helpful for audits
    }
  ],

  shippingAddress: {
    fullName: String,
    address: String,
    city: String,
    postalCode: String,
    country: String,
    phone: String
  },

  totalAmount: { type: Number, required: true },

  // 💳 Cashfree Integration Fields
  cashfreeOrderId: { type: String },
  paymentMethod: { type: String },
  paymentStatus: { type: String, default: 'Pending' },
  paidAt: { type: Date },

  // 📦 Order State
  status: { type: String, default: 'Pending' },

  // 🧠 AI Summary
  summary: { type: String }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
