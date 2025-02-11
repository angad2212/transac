// backend/routes/account.js
const express = require('express');
const { authMiddleware } = require('../middleware');
const { Account } = require('../db');
const { default: mongoose } = require('mongoose');
const rateLimit = require('express-rate-limit');

const router = express.Router();

//rate limiting:
// Per-User Rate Limit (5 transactions per minute)
const userRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Max 5 requests per minute per user
  message: { message: "Transaction limit exceeded. Try again in a minute." },
  keyGenerator: (req) => req.userId || req.ip, // Identify users by userId, fallback to IP
});

// Per-IP Rate Limit (20 requests per second)
const ipRateLimiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 20, // Max 20 requests per second per IP
  message: { message: "Too many requests from this IP. Try again later." },
  keyGenerator: (req) => req.ip, // Identify users by IP
});

router.get("/balance", authMiddleware, async (req, res) => { //tested
    const account = await Account.findOne({
        userId: req.userId
    });

    res.json({
        balance: account.balance
    })
});

router.post("/transfer", authMiddleware, userRateLimiter, ipRateLimiter, async (req, res) => { //tested
    const session = await mongoose.startSession();

    session.startTransaction();
    const { amount, to } = req.body;

    // Fetch the accounts within the transaction
    const account = await Account.findOne({ userId: req.userId }).session(session);

    if (!account || account.balance < amount) {
        await session.abortTransaction();
        return res.status(400).json({
            message: "Insufficient balance"
        });
    }

    const toAccount = await Account.findOne({ userId: to }).session(session);

    if (!toAccount) {
        await session.abortTransaction();
        return res.status(400).json({
            message: "Invalid account"
        });
    }

    // Perform the transfer
    await Account.updateOne({ userId: req.userId }, { $inc: { balance: -amount } }).session(session);
    await Account.updateOne({ userId: to }, { $inc: { balance: amount } }).session(session);

    // Commit the transaction
    await session.commitTransaction();

    res.json({
        message: "Transfer successful"
    });
});

module.exports = router;