const mongoose = require('mongoose');

const cartSchema = mongoose.Schema({
    user:{
        type : mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required : true
    },
    price:{
        type: Number,
        default:0
    },
    quantity: {
        type :Number,
        required : true
    },
    product: {
        type : mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required : true
    },
    size:{
        type: String,
        default:'one size',
        required : true
    },
    color:{
        type: String,
        default:'white',
        required : true
    }
})

exports.Cart = mongoose.model('Cart', cartSchema);
