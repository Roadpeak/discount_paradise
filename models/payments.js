const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
    PhoneNumber: {
        type: String,
        required: true,
    },
    Amount: {
        type: Number,
        required: true,
    },
    Transactioncode: {
        type: String,
        required: true,
    },
},
    { timestamps: true });

const Transaction = new mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;