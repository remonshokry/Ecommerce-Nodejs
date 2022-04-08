const mongoose = require('mongoose');
const { stringify } = require('nodemon/lib/utils');

const orderItemSchema = mongoose.Schema({
    quantity: {
        type :Number,
        required : true
    },
    product: {
        type : mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required : true
    },
    color:{
        type: String,
        default: ' '
    },
    size:{
        type: String,
        default: ' '
    },
    price:{
        type: Number,
        default :0
    }
})

exports.OrderItem = mongoose.model('OrderItem' , orderItemSchema);