const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    color:{
        type:String,
        default:'#000'
    },
    icon:{
        type:String,
    },
    image:{
        type:String,
    }

})

exports.Category = mongoose.model('Category', categorySchema);
