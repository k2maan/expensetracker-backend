const mongoose = require("mongoose");

const incomeSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true
    },
    date: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        
    },
    
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

const income = new mongoose.model("income",incomeSchema);


module.exports = income;