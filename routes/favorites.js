const {Favorite} = require('../models/favourite');
const {Product} = require('../models/product');
const {User} = require('../models/user');
const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose')


router.get('/' , async (req , res)=>{
    let decodedToken = '';
    var token = req.headers[process.env.TOKEN];
    if (!token)
        return res.status(401).send({ auth: false, message: "No token provided." });
  
    jwt.verify(token, process.env.SECRETKEY , function (err, decoded) {
        if (err)
            return res.status(500).send({ auth: false, message: "Failed to authenticate token." });
        decodedToken = decoded;
    });

    const user = await User.findById(decodedToken.userId );
    if(!user){
        return res.status(500).send('No user with this Id');
    }

    const favList = await Favorite.find({user : decodedToken.userId}).populate('product').select('-user -_id');
    if (!favList)
    {
        return res.status(401).json({success: false , message: 'Cannot find Favourites'});
    }
    return res.status(200).send(favList);
})

// router.get('/user/:userId' , async (req , res)=>{
//     const favList = await Favorite.find({user : req.params.userId});
//     if (!favList)
//     {
//         return res.status(401).json({success: false , message: 'Cannot find Favourites'});
//     }
//     return res.status(200).send(favList);
// })


// router.get('/details' , async (req , res)=>{
//     const favList = await Favorite.find().select('-passwordHash').populate('product');
//     if (!favList)
//     {
//         return res.status(401).json({success: false , message: 'Cannot find Favourites'});
//     }
//     return res.status(200).send(favList);
// })



router.post('/' , async(req, res)=>{
    let decodedToken = '';
    var token = req.headers[process.env.TOKEN];
    if (!token)
        return res.status(401).send({ auth: false, message: "No token provided." });
  
    jwt.verify(token, process.env.SECRETKEY , function (err, decoded) {
        if (err)
            return res.status(500).send({ auth: false, message: "Failed to authenticate token." });
        decodedToken = decoded;
    });

    const user = await User.findById(decodedToken.userId );
    if(!user){
        return res.status(500).send('No user with this Id');
    }


    const product = await Product.findById(req.body.product);
    if(!product){
        return res.status(400).send('Invalid product Id');
    }

    let favorite = new Favorite({
        product: req.body.product,
        user : decodedToken.userId
    })
    favorite = await favorite.save();
    if(!favorite){
        return res.status(500).send('The favorite item cannot be created');
    }
    return res.status(200).send(favorite);
})


router.delete('/:prodId' , async (req , res)=>{
    if (!mongoose.isValidObjectId(req.params.prodId)){
        return res.status(400).send('Invalid product Id');
    }
    let decodedToken = '';
    var token = req.headers[process.env.TOKEN];
    if (!token)
        return res.status(401).send({ auth: false, message: "No token provided." });
  
    jwt.verify(token, process.env.SECRETKEY , function (err, decoded) {
        if (err)
            return res.status(500).send({ auth: false, message: "Failed to authenticate token." });
        decodedToken = decoded;
  });

    const user = await User.findById(decodedToken.userId );
    if(!user){
        return res.status(500).send('No user with this Id');
    }

    const favItem = await Favorite.findOneAndDelete({ user :decodedToken.userId , product : req.params.prodId});
    if(!favItem){
        return res.status(505).send('Cannot Find This product');
    }
    return res.status(200).send('the item deleted successfully');
})


router.delete('/', async (req, res)=>{
    let decodedToken = '';
    var token = req.headers[process.env.TOKEN];
    if (!token)
        return res.status(401).send({ auth: false, message: "No token provided." });
  
    jwt.verify(token, process.env.SECRETKEY , function (err, decoded) {
        if (err)
            return res.status(500).send({ auth: false, message: "Failed to authenticate token." });
        decodedToken = decoded;
  });

    const user = await User.findById(decodedToken.userId );
    if(!user){
        return res.status(500).send('No user with this Id');
    }


    const favList = await Favorite.find({user : decodedToken.userId} );
    if(favList.length)
    {
        favList.forEach(async (el)=>{
            await Favorite.findByIdAndDelete(el._id);
        })
        return res.status(200).send("All Favorite List items has been removed")
    }
    return res.status(505).send("Favorite List is Empty")

})


// router.get('/' , async (req , res)=>{
//     const favList = await Favorite.find();
//     if (!favList)
//     {
//         return res.status(401).json({success: false , message: 'Cannot find Favourites'});
//     }
//     return res.status(200).send(favList);
// })

module.exports = router;