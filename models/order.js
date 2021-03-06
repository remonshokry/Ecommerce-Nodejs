const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    orderItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderItem',
        required: true
    }],
    shippingAddress1 :{
        type : String,
        required: true
    },
    shippingAddress2 :{
        type: String
    },
    city :{
        type: String,
    },
    zip:{
        type : String ,
    },
    country:{
        type:String,
    },
    phone:{
        type: String,
        required: true
    },
    status:{
        type:String,
        default : 'Pending',
        required: true
    },
    totalPrice: {
        type : Number
    },
    user:{
        type : mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dateOrdered:{
        type: Date ,
        default: Date.now
    }
})

exports.Order = mongoose.model('Order', orderSchema);
