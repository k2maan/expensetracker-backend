const express = require("express");
const router = express.Router();
const fetchUser = require("../middleware/fetchUser");
const Income = require("../models/incomeSchema");

// Route 1: Add an income for a user. Login required.
router.post("/addincome", fetchUser, async (req, res) => {
  try {
    const { amount, date, category } = req.body;
    const income = new Income({
      amount,
      date,
      category,
      userId: req.user.id,
    });
    const savedIncome = await income.save();
    res.json(savedIncome);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

// Route 2: Get all incomes of a user. Login required.
router.get("/income", fetchUser, async (req, res) => {
  try {
    const incomes = await Income.find({ userId: req.user.id });
    res.json(incomes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

// Route 3: Get a specific income of a user. Login required.
router.get("/income/:id", fetchUser, async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);
    if (!income) {
      return res.status(404).json({ error: "Income not found" });
    }
    if (income.userId.toString() !== req.user.id) {
      return res.status(401).json({ error: "Not authorized" });
    }
    res.json(income);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

// Route 4: Delete an income of a user. Login required.
router.delete("/deleteincome/:id", fetchUser, async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);
    if (!income) {
      return res.status(404).json({ error: "Income not found" });
    }
    if (income.userId.toString() !== req.user.id) {
      return res.status(401).json({ error: "Not authorized" });
    }
    await income.remove();
    res.json({ msg: "Income deleted" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

// Route 5: EDIT an income of a user. Login required.
router.put("/editincome/:id", fetchUser, async (req, res) => {
    try {
      const { amount, date, category } = req.body;
      let income = await Income.findById(req.params.id);
      if (!income) {
        return res.status(404).json({ error: "Income not found" });
      }
      if (income.userId.toString() !== req.user.id) {
        return res.status(401).json({ error: "Not authorized" });
      }
      income.amount = amount;
      income.date = date;
      income.category = category;
      await income.save();
      res.json(income);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error");
    }
  });

module.exports = router;

