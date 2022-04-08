const {Order} = require('../models/order');
const express = require('express');
const { OrderItem } = require('../models/order-item');
const {Product} = require('../models/product');
const { Cart } = require('../models/cart');
const router = express.Router();
const jwt = require('jsonwebtoken');
const {User} = require('../models/user');

router.get(`/`, async (req, res) =>{
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
    const userOrders = await Order.find({user : decodedToken.userId}).populate('user', 'name')
    .populate({ 
        path: 'orderItems', populate: {
            path : 'product' , populate: 'category'} 
        });

    if(!userOrders){
        return req.status(505).send('NO ORDERS FOR THIS USER');
    }
    res.status(200).send(userOrders);
})

router.get(`/all`, async (req, res) =>{
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
    const userOrders = await Order.find().populate('user', 'name')
    .populate({ 
        path: 'orderItems', populate: {
            path : 'product' , populate: 'category'} 
        });

    if(!userOrders){
        return req.status(505).send('NO ORDERS FOR THIS USER');
    }
    res.status(200).send(userOrders);
})

router.get(`/:id`, async (req, res) =>{
    const order = await Order.findById(req.params.id)
    .populate('user', 'name')
    .populate({ 
        path: 'orderItems', populate: {
            path : 'product', populate: 'category'} 
        });

    if(!order) {
        res.status(500).json({success: false})
    } 
    res.send(order);
})



router.post('/checkout' , async (req, res)=>{
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
    
    
    const userOrderItems = await Cart.find({user: decodedToken.userId}).select('-user -_id');
    const orderItemsIds = Promise.all(userOrderItems.map(async (orderItem) =>{
            let newOrderItem = new OrderItem({
                quantity: orderItem.quantity,
                product: orderItem.product,
                color : orderItem.color,
                size: orderItem.size,
                price: orderItem.price
            })
            
            newOrderItem = await newOrderItem.save();
            console.log(newOrderItem);
    
            return newOrderItem._id;
        }))

        const orderItemsIdsResolved =  await orderItemsIds;
        let totalPrice = 0;
        userOrderItems.forEach(el=>{
            totalPrice += el.price;
        })
        try{

            let order = new Order({
                orderItems: orderItemsIdsResolved,
                shippingAddress1: req.body.shippingAddress1,
            shippingAddress2: req.body.shippingAddress2,
            city: req.body.city,
            zip: req.body.zip,
            country: req.body.country,
            phone: user.phone,
            status: 'Pending',
            totalPrice: totalPrice,
            user: user._id,
        })
        order = await order.save();
    
        if(!order)
        return res.status(400).send('the order cannot be created!')
        
        res.send(order);
    }catch{
        return res.status(510).send("ERROR OCURRED");
    }
        
    })
    

// api/v1/orders (POST)
// router.post('/', async (req,res)=>{
//     const orderItemsIds = Promise.all(req.body.orderItems.map(async (orderItem) =>{
//         let newOrderItem = new OrderItem({
//             quantity: orderItem.quantity,
//             product: orderItem.product,
//             color : orderItem.color,
//             size: orderItem.size
//         })
        
//         newOrderItem = await newOrderItem.save();
//         console.log(newOrderItem);

//         return newOrderItem._id;
//     }))
//     const orderItemsIdsResolved =  await orderItemsIds;

//     const totalPrices = await Promise.all(orderItemsIdsResolved.map(async (orderItemId)=>{
//         const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
//         const totalPrice = orderItem.product.price * orderItem.quantity;
//         return totalPrice
//     }))

//     const totalPrice = totalPrices.reduce((a,b) => a +b , 0);

//     let order = new Order({
//         orderItems: orderItemsIdsResolved,
//         shippingAddress1: req.body.shippingAddress1,
//         shippingAddress2: req.body.shippingAddress2,
//         city: req.body.city,
//         zip: req.body.zip,
//         country: req.body.country,
//         phone: req.body.phone,
//         status: req.body.status,
//         totalPrice: totalPrice,
//         user: req.body.user,
//     })
//     order = await order.save();

//     if(!order)
//     return res.status(400).send('the order cannot be created!')

//     res.send(order);
// })


// router.put('/:id',async (req, res)=> {
//     const order = await Order.findByIdAndUpdate(
//         req.params.id,
//         {
//             // 'Approved'
//             status: req.body.status
//         },
//         { new: true}
//     )

//     if(!order)
//     return res.status(400).send('The order cannot be update!')

//     res.send(order);
// })

router.delete('/:id', (req, res)=>{
    Order.findByIdAndRemove(req.params.id).then(async order =>{
        if(order) {
            await order.orderItems.map(async orderItem => {
                await OrderItem.findByIdAndRemove(orderItem)
            })
            return res.status(200).json({success: true, message: 'the order is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "order not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
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

    const user = await User.findById(decodedToken.userId);
    if(!user){
        return res.status(401).send('No User with this Id');
    }


    const userOrders = await Order.find({user : decodedToken.userId});
    if(!userOrders){
        res.status(505).send('NO ORDERS')
    }

    userOrders.forEach(async (el)=>{
        Order.findByIdAndRemove(el._id).then(async order =>{
            if(order) {
                await order.orderItems.map(async orderItem => {
                    await OrderItem.findByIdAndRemove(orderItem)
                })
                return res.status(200).json({success: true, message: 'orders are deleted!'})
            } else {
                return res.status(404).json({success: false , message: "order not found!"})
            }
        }).catch(err=>{
           return res.status(500).json({success: false, error: err}) 
        })    
    })
    
    
    
    
})


router.get('/get/totalsales', async (req, res)=> {
    const totalSales= await Order.aggregate([
        { $group: { _id: null , totalsales : { $sum : '$totalPrice'}}}
    ])

    if(!totalSales) {
        return res.status(400).send('The order sales cannot be generated')
    }

    res.send({totalsales: totalSales.pop().totalsales})
})

router.get(`/get/count`, async (req, res) =>{
    const orderCount = await Order.countDocuments()

    if(!orderCount) {
        res.status(500).json({success: false})
    } 
    res.send({
        orderCount: orderCount
    });
})

router.get(`/get/userorders/:userid`, async (req, res) =>{
    const userOrderList = await Order.find({user: req.params.userid}).populate({ 
        path: 'orderItems', populate: {
            path : 'product', populate: 'category'} 
        }).sort({'dateOrdered': -1});

    if(!userOrderList) {
        res.status(500).json({success: false})
    } 
    res.send(userOrderList);
})



module.exports =router;