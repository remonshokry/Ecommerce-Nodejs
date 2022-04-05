const {Cart} = require('../models/cart');
const {User} = require('../models/user');
const express = require('express');
const { OrderItem } = require('../models/order-item');
const {Product} = require('../models/product');
const router = express.Router();
const mongoose = require('mongoose')



router.get('/:userId' , async(req,res)=>{
    const user = await User.findById(req.params.userId);
    if(!user){
        return res.status(500).send('No user with this Id');
    }

    const cartItems =  await Cart.find({user: req.params.userId}).select('-user');
    if (!cartItems){
        return res.status(401).send("Cart is empty");
    }
    return res.status(200).send(cartItems);
})


router.post('/:userId', async (req,res)=>{

    const product = await Product.findById(req.body.product);
    if(!product){
        return res.status(401).send('No Product with this Id');
    }
    const user = await User.findById(req.params.userId);
    if(!user){
        return res.status(401).send('No User with this Id');
    }

    const price = await product.price * req.body.quantity;

    let cartItem = new Cart({
        product: req.body.product,
        quantity: req.body.quantity,
        user: req.params.userId,
        price: price ,
    })
    cartItem = await cartItem.save();

    if(!cartItem)
    return res.status(400).send('the order cannot be created!')

    res.send(cartItem);
})

router.get(`/get/count/:userId`, async (req, res) =>{
    const user = await User.findById(req.params.userId);
    if(!user){
        return res.status(500).send('No user with this Id');
    }
    const cartCount = await Cart.find({user: req.params.userId}).countDocuments()

    if(!cartCount) {
        res.status(500).json({success: false})
    } 
    res.send({
        cartCount: cartCount
    });
})


router.put('/:id',async (req, res)=> {

    const cartItemRef = await Cart.findById(req.params.id);
    if(!cartItemRef)
        return res.status(400).send('the item cannot be update!')
    const product = await Product.findById(cartItemRef.product);
    if(!product)
        return res.status(400).send('the product cannot be found')
    const price = await  req.body.quantity * product.price;
    
    const cartItem = await Cart.findByIdAndUpdate(
        req.params.id,
        {
            quantity: req.body.quantity,
            price : price
        },
        { new: true}
    )
    if(!cartItem)
        return res.status(400).send('the item cannot be update!')
    res.send(cartItem);
})

router.put('/product/:id', async(req, res)=>{
    if (!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send('Invalid product Id');
    }
    const productRef = await Product.findById(req.params.id);
    if(!productRef)
        return res.status(400).send('the product cannot be found')
    const price = await  req.body.quantity * productRef.price;
    const product =  await Cart.findOneAndUpdate(
        {product : req.params.id},
        {
            quantity: req.body.quantity,
            price : price
        },
        { new: true});
        if (product)
        {
            return res.status(200).json({success : true , error : 'The Item updated successfully'});
        }
        return res.status(500).json({success : false , error : 'Cannot update product'});
})



router.delete('/:id', async (req, res)=>{
    if (!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send('Invalid cart items Id');
    }
    Cart.findByIdAndRemove(req.params.id)
    .then(cartItem=>{
        if(cartItem){
            return res.status(200).json({success : true , message : 'the item deleted successfully'});
        }
        else{
            res.status(404).json({success : false , message : 'item not found'});
        }
    })
    .catch(err=>{
        return res.status(500).json({success : false , error : err});
    })
})

router.delete('/product/:id', (req, res)=>{
    if (!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send('Invalid product Id');
    }
    Cart.findOneAndDelete({product : req.params.id})
    .then(cartItem=>{
        if(cartItem){
            return res.status(200).json({success : true , message : 'the item deleted successfully'});
        }
        else{
            res.status(404).json({success : false , message : 'item not found'});
        }
    })
    .catch(err=>{
        return res.status(500).json({success : false , error : err});
    })
})




module.exports = router;

// 624b8da3ebf47884d82cefbe
// 5f15d8852a025143f9593a7c prod
// 5f1687e1be2e99a158c08504 user