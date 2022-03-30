const {Category} = require('../models/category');
const express = require('express');
const { default: mongoose } = require('mongoose');
const router = express.Router();


//GET ALL 
router.get(`/`, async (req, res) =>{
    const categoryList = await Category.find();

    if(!categoryList) {
        res.status(500).json({success: false})
    } 
    res.send(categoryList);
})

//GET BY ID
router.get('/:id' , async (req , res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        res.status(400).send('Invalid category Id');
    }
    const category = await Category.findById(req.params.id);
    if (!category){
        res.status(500).json({message : 'The category with this Id is not found'})
    }
    res.status(200).send(category);
})

//POST
router.post('/' , async (req , res)=>{
    let category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color,
        image: req.body.image
    })
    category = await category.save();

    if(!category)
        res.status(404).send('cannot create category')

    res.send(category);
})

//DELETE
router.delete('/:id' , (req , res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        res.status(400).send('Invalid category Id');
    }
    Category.findByIdAndRemove(req.params.id)
    .then((category) =>{
        if (category)
            return res.status(200).json({success:true , message: 'category is deleted'});
        else    
            return res.status(404).json({success:false , message: 'category is NOT found'});
    })
    .catch(err=>{
        res.status(400).json({success: false , error: err})
    })
})
    

//PUT 
router.put('/:id' , async (req , res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        res.status(400).send('Invalid category Id');
    }

    const category = await Category.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color,
            image: req.body.image
        },
        {new : true}
    )
    if(!category){
        res.status(404).send('cannot update category');
    }

    res.status(200).send(category);
})

module.exports =router;