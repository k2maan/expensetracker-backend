const mongoose = require("mongoose");

// const expenseSchema = new mongoose.Schema({
//     amount: {
//         type: Number,
//         required: true
//     },
//     date: {
//         type: String,
//         required: true,
//     },
//     category: {
//         type: String,
//         required: true,
//     },
    
// });

// const expenses = new mongoose.model("expenses",expenseSchema);


// module.exports = expenses;
const expenseSchema = new mongoose.Schema({
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
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});
 const expenses = new mongoose.model("expenses",expenseSchema);


 module.exports = expenses;