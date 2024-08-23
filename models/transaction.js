const mongoose = require ("mongoose")


const TransactionSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
},
{ timestamps: true })

const Vehicle = mongoose.model("Transaction", TransactionSchema)
module.exports = Vehicle