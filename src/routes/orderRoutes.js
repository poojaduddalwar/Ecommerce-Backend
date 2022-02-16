import express from 'express'
import Razorpay from "razorpay";
import crypto from 'crypto'

const router = express.Router()

// type : POST REQUEST
// path : /api/v1/order/createOrder

router.post("/createOrder", async (req, res) => {
    try {
        const { amount } = req.body
        console.log({ amount })
        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const options = {
            amount: amount, // amount in smallest currency unit
            currency: "INR",
            receipt: "receipt_order_74394",
        };

        const order = await instance.orders.create(options);

        if (!order) return res.status(500).send("Some error occured");

        res.json(order);
    } catch (error) {
        console.log(error)
        res.status(500).send(error);
    }
});

// type : POST REQUEST
// path : /api/v1/order/verify

router.post("/verify", async (req, res) => {
    try {
        // getting the details back from our font-end
        const {
            orderCreationId,
            razorpayPaymentId,
            razorpayOrderId,
            razorpaySignature,
        } = req.body;

        // Creating our own digest
        // The format should be like this:
        // digest = hmac_sha256(orderCreationId + "|" + razorpayPaymentId, secret);
        const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);

        shasum.update(`${orderCreationId}|${razorpayPaymentId}`);

        const digest = shasum.digest("hex");

        // comaparing our digest with the actual signature
        if (digest !== razorpaySignature)
            return res.status(400).json({ msg: "Transaction not legit!" });

        // THE PAYMENT IS LEGIT & VERIFIED
        // YOU CAN SAVE THE DETAILS IN YOUR DATABASE IF YOU WANT

        res.json({
            msg: "Success",
            orderId: razorpayOrderId,
            paymentId: razorpayPaymentId,
        });
    } catch (error) {
        console.log(error)
        res.status(500).send(error);
    }
});


// type : POST REQUEST
// path : /api/v1/order/webhook

router.post("/webhook", async (req, res) => {
    try {
        // console.log(req.body)
        const { payload } = req.body
        console.log(payload)
    } catch (error) {
        console.log(error)
        res.status(500).send(error);
    }
});

export default router