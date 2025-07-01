import axios from 'axios';

const APP_ID = process.env.CF_APP_ID;
const SECRET_KEY = process.env.CF_SECRET_KEY;
const BASE_URL = 'https://sandbox.cashfree.com/pg';

export const initiatePayment = async (req, res) => {
  try {
    const { orderId, orderAmount, customerName, customerEmail, customerPhone } = req.body;
    const payload = {
      order_id: orderId,
      order_amount: orderAmount,
      order_currency: 'INR',
      customer_details: {
        customer_id: customerEmail,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone
      }
    };
    const headers = {
      'x-api-version': '2022-09-01',
      'x-client-id': APP_ID,
      'x-client-secret': SECRET_KEY,
      'Content-Type': 'application/json'
    };
    const { data } = await axios.post(`${BASE_URL}/orders`, payload, { headers });
    return res.status(200).json({ paymentSessionId: data.payment_session_id });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ message: 'Cashfree initiation failed' });
  }
};
