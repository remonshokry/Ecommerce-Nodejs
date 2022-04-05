const mongoose = require('mongoose');

const cartSchema = mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required : true
    },
    quantity: {
        type : Number,
        required: true
    },
    user:{
        type : mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required : true
    },
    price:{
        type: Number,
        default:0
    }
})

exports.Cart = mongoose.model('Cart', cartSchema);
