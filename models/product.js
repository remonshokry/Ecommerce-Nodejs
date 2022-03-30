const mongoose = require('mongoose');

const colorSchema = mongoose.Schema({
    colorName:{
        type:String,
        default:''
    },
    colorHex :{
        type:String,
        default:'#fff'
    }
})


const productSchema = mongoose.Schema({
    name: {
        type:String,
        required : true
    },
    description: {
        type: String,
        default: ''
    },
    image:{
        type:String,
        default:''
    },
    images:[{
        type:String,
    }],
    price:{
        type: Number,
        default : 0
    },
    category:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Category',
        required :true
    },
    countInStock:{
        type: Number,
        required: true, 
        min:0,
        max: 255,
    },
    isOnSale:{
        type:Boolean,
        default : 0
    },
    colors:{
        type:[ colorSchema ],
        default: undefined
    },
    sizes:{
        type:[String],
        default:'One Size'
    },
    // IGNORED
    dateCreated:{
        type:Date,
        default : Date.now
    }
})


exports.Product = mongoose.model('Product', productSchema);
