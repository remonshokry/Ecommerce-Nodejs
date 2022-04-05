const {Favorite} = require('../models/favourite');
const {Product} = require('../models/product');
const {User} = require('../models/user');
const express = require('express');
const router = express.Router();


router.get('/details/user/:userId' , async (req , res)=>{
    const favList = await Favorite.find({user : req.params.userId}).populate('product');
    if (!favList)
    {
        return res.status(401).json({success: false , message: 'Cannot find Favourites'});
    }
    return res.status(200).send(favList);
})

router.get('/user/:userId' , async (req , res)=>{
    const favList = await Favorite.find({user : req.params.userId});
    if (!favList)
    {
        return res.status(401).json({success: false , message: 'Cannot find Favourites'});
    }
    return res.status(200).send(favList);
})


// router.get('/details' , async (req , res)=>{
//     const favList = await Favorite.find().select('-passwordHash').populate('product');
//     if (!favList)
//     {
//         return res.status(401).json({success: false , message: 'Cannot find Favourites'});
//     }
//     return res.status(200).send(favList);
// })



router.post('/' , async(req, res)=>{
    const user = await User.findById(req.body.user);
    if(!user){
        return res.status(400).send('Invalid user Id');
    }
    const product = await Product.findById(req.body.product);
    if(!product){
        return res.status(400).send('Invalid product Id');
    }
    let favourite = new Favorite({
        product: req.body.product,
        user : req.body.user
    })
    favourite = await favourite.save();
    if(!favourite){
        return res.status(500).send('The favourite item cannot be created');
    }
    return res.status(200).send(favourite);
})

router.delete('/:favId' , async (req , res)=>{
    const favItem = await Favorite.findByIdAndDelete(req.params.favId);
    if (!favItem)
    {
        return res.status(401).json({success: false , message: 'Cannot delete Favorite'});
    }
    return res.status(200).send({success : true , message : "favorite Item deleted successfully"});
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