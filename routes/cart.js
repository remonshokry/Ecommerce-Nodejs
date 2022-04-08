const {Cart} = require('../models/cart');
const {User} = require('../models/user');
const express = require('express');
const { OrderItem } = require('../models/order-item');
const {Product} = require('../models/product');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");



router.get('/' , async(req,res)=>{
    let decodedToken = '';
    var token = req.headers.authorization.split(' ')[1];
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
    

    const cartItems =  await Cart.find({user: decodedToken.userId}).select('-user -_id').populate('product');
    if (!cartItems){
        return res.status(401).send("Cart is empty");
    }
    return res.status(200).send(cartItems);
})


router.post('/', async (req,res)=>{
    let decodedToken = '';
    var token = req.headers.authorization.split(' ')[1];
    if (!token)
        return res.status(401).send({ auth: false, message: "No token provided." });
  
    jwt.verify(token, process.env.SECRETKEY , function (err, decoded) {
        if (err)
            return res.status(500).send({ auth: false, message: "Failed to authenticate token." });
        decodedToken = decoded;
    });

    const user = await User.findById(decodedToken.userId);
    if(!user){
        return res.status(401).send('No User with this Id');
    }
    const product = await Product.findById(req.body.product);
    if(!product){
        return res.status(401).send('No Product with this Id');
    }
    let price = await req.body.quantity * product.price;
                
    let size ;

    if(product?.sizes)
        size = product.sizes[0];
        
    if (req.body.size){
        size = req.body.size
    }

    let color ;

    if(product?.colors)
        color = product.colors[0];

        if (req.body.color){
            color = req.body.color
        }
        
        
    let cartItemId ;
    let prevCartItems = await Cart.find({user : decodedToken.userId , product: req.body.product});
    prevCartItems.forEach(async (prevCartItem)=>{
        if(prevCartItem && 
            prevCartItem.color == req.body.color &&
            prevCartItem.size == req.body.size)
            {
                cartItemId = prevCartItem._id;
            }
    })

    if(cartItemId){
        let price = await req.body.quantity * product.price;
        const updatedCartItem =  CartItem = await Cart.findByIdAndUpdate(
            cartItemId,
            {
                product : req.body.product,
                price : price,
                quantity : req.body.quantity,
                user : decodedToken.userId,
                size : size,
                color : color
            },
            {new : true}
            )
            if(!updatedCartItem)
            {
                    return res.status(505).send("unable to update cart");
            }
            return res.status(200).send(updatedCartItem);
        }
        else{
            let newCartItem = new Cart({
                    product : req.body.product ,
                    price : price ,
                    quantity : req.body.quantity ,
                    user : decodedToken.userId ,
                    size : size,
                    color : color
            })
        newCartItem = await newCartItem.save();
        if(!newCartItem ){
            return res.status(505).send("Cannot add item to cart")
        }
            return res.status(200).send(newCartItem);
        }   

}) 

router.get(`/get/count/`, async (req, res) =>{
    let decodedToken = '';
    var token = req.headers.authorization.split(' ')[1];
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
    const userCart = await Cart.find({user: decodedToken.userId});

    let cartCount = 0;
    userCart.forEach((el)=>{
        cartCount += el.quantity;
    })
    let totalPrice = 0;
    userCart.forEach((el)=>{
        totalPrice += el.price;
    })

    res.send({
        cartCount: cartCount,
        totalPrice : totalPrice
    });
})


// router.put('/:id',async (req, res)=> {

//     const cartItemRef = await Cart.findById(req.params.id);
//     if(!cartItemRef)
//         return res.status(400).send('the item cannot be update!')
//     const product = await Product.findById(cartItemRef.product);
//     if(!product)
//         return res.status(400).send('the product cannot be found')
//     const price = await  req.body.quantity * product.price;
    
//     const cartItem = await Cart.findByIdAndUpdate(
//         req.params.id,
//         {
//             // product: req.body.product,
//             quantity: req.body.quantity,
//             price : price
//         },
//         { new: true}
//     )
//     if(!cartItem)
//         return res.status(400).send('the item cannot be update!')
//     res.send(cartItem);
// })

// router.put('/product/:id', async(req, res)=>{
//     if (!mongoose.isValidObjectId(req.params.id)){
//         return res.status(400).send('Invalid product Id');
//     }
//     const productRef = await Product.findById(req.params.id);
//     if(!productRef)
//         return res.status(400).send('the product cannot be found')
//     const price = await  req.body.quantity * productRef.price;
//     const product =  await Cart.findOneAndUpdate(
//         {product : req.params.id},
//         {
//             quantity: req.body.quantity,
//             price : price
//         },
//         { new: true});
//         if (product)
//         {
//             return res.status(200).json({success : true , error : 'The Item updated successfully'});
//         }
//         return res.status(500).json({success : false , error : 'Cannot update product'});
// })



router.delete('/product/:prodId', async (req, res)=>{
    if (!mongoose.isValidObjectId(req.params.prodId)){
        return res.status(400).send('Invalid product Id');
    }
    let decodedToken = '';
    var token = req.headers.authorization.split(' ')[1];
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
    const userOrdersFromProduct = await Cart.find({user : decodedToken.userId , product: req.params.prodId })
    
    if(!userOrdersFromProduct)
    {
        return res.status(505).send('No Items from this products')
    }
    let cartItemId;
    userOrdersFromProduct.forEach(async (el)=>{
        if(el.size === req.body.size && el.color === req.body.color)
        {
            cartItemId = el._id;
        }
    })
    if(!cartItemId){
        return res.status(505).send('Cannot Find This product');
    }
    const deletedItem = await Cart.findByIdAndDelete(cartItemId);
    if(!deletedItem){
        return res.status(506).send('Cannot Find This product');
    }

    return res.status(200).send('the item deleted successfully');
})

router.delete('/', async (req, res)=>{
    let decodedToken = '';
    var token = req.headers.authorization.split(' ')[1];
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


    const userCart = await Cart.find({user : decodedToken.userId} );
    if(userCart.length)
    {
        userCart.forEach(async (el)=>{
            await Cart.findByIdAndDelete(el._id);
        })
        return res.status(200).send("All Cart items has been removed")
    }
    return res.status(505).send("Cannot Empty the cart")


})




module.exports = router;

// 624b8da3ebf47884d82cefbe
// 5f15d8852a025143f9593a7c prod
// 5f1687e1be2e99a158c08504 user