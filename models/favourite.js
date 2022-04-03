const mongoose = require('mongoose')

const favoriteSchema = mongoose.Schema({
    product : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Product',
        required: true
    },
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    dateListed:{
        type: Date ,
        default: Date.now
    }
})

exports.Favorite = mongoose.model('Favorite' , favoriteSchema);