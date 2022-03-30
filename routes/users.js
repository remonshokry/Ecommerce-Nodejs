const {User} = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

//Get Custom users list
router.get('/' , async(req , res)=>{
    let filter = '';
    if(req.query.list){
        filter = req.query.list.split('+').join(' ');
    }
    console.log('\n' + filter + '\n');

    const user = await User.find().select(filter).select('-passwordHash');
    if (!user){
        return res.status(500).json({success: false , message : 'Cannot find users list'});
    }

    return res.status(200).send(user);
})

//get
router.get(`/`, async (req, res) =>{
    const userList = await User.find().select('-passwordHash');

    if(!userList) {
        res.status(500).json({success: false , message : 'Cannot find users list'})
    } 
    res.send(userList);
})

//GET ONE USER BY ID
router.get('/:id' , async(req , res)=>{
    if (!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send('Invalid Id');
    }

    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user){
        return es.status(500).json({success: false , message : 'Cannot find user'});
    }

    return res.status(200).send(user);
})

// register
router.post('/register' , async (req , res)=>{
    let newUser = new User ({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password , 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip :req.body.zip,
        city: req.body.city,
        country: req.body.country
    })
    newUser = await newUser.save();

    if(!newUser){
        return res.status(500).send('The user cannot be created');
    }

    return res.status(200).send(newUser);
})


// PUT
router.put('/:id' , async (req , res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send('invalid id');
    }

    const userExist = await User.findById(req.params.id);
    let newPasswordHash;
    if (req.body.password){
        newPasswordHash = bcrypt.hashSync(req.body.password , 10);
    }else{
        newPasswordHash = userExist.passwordHash;
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            email: req.body.email,
            passwordHash: newPasswordHash,
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
            street: req.body.street,
            apartment: req.body.apartment,
            zip :req.body.zip,
            city: req.body.city,
            country: req.body.country
        },
        {new: true}
    )

    if (!user){
        return res.status(500).send('The user cannot be updated')
    }

    res.status(200).send(user);
})


//////////////// LOGIN

router.post('/login' , async (req , res)=>{
    const user = await User.findOne({email : req.body.email});
    const secret = process.env.SECRETKEY;
    if(!user)
    {
        return res.status(400).send('The User is not found');
    }
    if(bcrypt.compareSync(req.body.password , user.passwordHash))
    {
        const token = jwt.sign(
            {
                userId : user.id,
                isAdmin: user.isAdmin
            },
            secret,
            {expiresIn : '1d'}
        )
        res.status(200).send({userEmail : user.email , token : token});
    }else{
        res.status(400).send('Wrong Password');
    }
})

////get users count
router.get('/get/count' , async (req , res)=>{
    const usersCount = await Product.countDocuments();

    if(!usersCount && usersCount != 0 ){
        res.status(500).json({success : false})
    }
    res.status(200).json({ success : true , usersCount : usersCount});

})


/////delete user
router.delete('/:id' , (req , res)=>{
    if (!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send('Invalid user Id');
    }
    User.findByIdAndRemove(req.params.id)
    .then(user=>{
        if(user){
            return res.status(200).json({success : true , message : 'the user deleted successfully'});
        }
        else{
            res.status(404).json({success : false , message : 'user not found'});
        }
    })
    .catch(err=>{
        return res.status(500).json({success : false , error : err});
    })
})
module.exports =router;