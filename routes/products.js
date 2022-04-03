const {Product} = require('../models/product');
const express = require('express');
const { Category } = require('../models/category');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer'); 

 const FILE_TYPE_MAP = {
     'image/png' : 'png',
     'image/jpeg' : 'jpeg',
     'image/jpg' : 'jpg'
 }

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('Invalid image type');

        if(isValid){
            uploadError = null;
        }

      cb(uploadError , 'public/uploads')
    },
    filename: function (req, file, cb) {
      const fileName = file.originalname.split(' ').join('-');
      const extension = FILE_TYPE_MAP[file.mimetype];
      cb(null,`${fileName}-${Date.now()}.${extension}`)
    }
  })
  
  const uploadOptions = multer({ storage: storage })


//////////////CUSTOM GET APIs
//GET NAMES AND IMAGES (EDITING)

//GET PRODUCTS ON SALE
router.get(`/onsale`, async (req, res) =>{
    let productList = await Product.find({isOnSale : true});

    if(!productList) {
        res.status(500).json({success: false})
    } 
    res.status(200).send(productList);
})

//GET CERTAIN NUMBER OF ONSALE PRODUCTS
router.get(`/onsale/:count`, async (req, res) =>{
    const count = req.params.count ? req.params.count : 0 ; 
    let productList = await Product.find({isOnSale : true}).limit(+count);

    if(!productList) {
        res.status(500).json({success: false})
    } 
    res.status(200).send(productList);
})


///////// CATEGORY RELATED APIs

//GET PRODUCTS by CATEGORY NAME
router.get(`/category/:catName`, async (req, res) =>{
    let productList = await Product.find().populate('category');
    if(!productList) {
        res.status(500).json({success: false})
    } 

    const filteredProducts =  []
    productList.forEach(el => {
        if(el.category?.name == req.params.catName)
        {
            filteredProducts.push(el);
            console.log(el.category.name);
        }
    })  
    
    if (filteredProducts){
        return res.status(200).send(filteredProducts);
    }
    return res.status(404).send('NO products in this category');
})


//GET ALL PRODUCTS WITH CATEGORY DETAILS
// router.get(`/category`, async (req, res) =>{
//     let filter = {};
//     if(req.query.categories){
//         filter = {category :  req.query.categories.split('+')};
//     }

//     const productList = await Product.find(filter).populate('category');

//     if(!productList) {
//         res.status(500).json({success: false})
//     } 
//     res.status(200).send(productList);
// })

//GET PRODUCT by CATEGORY ID
// router.get(`/category/:catId`, async (req, res) =>{
//     if(!mongoose.isValidObjectId(req.params.catId)){
//         res.status(400).send('Invalid category Id');
//     }
    
//     let productList = await Product.find({category : req.params.catId});
//     if (productList){
//         return res.status(200).send(filteredProducts);
//     }
//     return res.status(404).send('NO products in this category');
// })



/// ADMIN APIs:
//COUNT FOR ALL PRODUCTS
router.get('/get/count' , async (req , res)=>{
    const productsCount = await Product.countDocuments();

    if(!productsCount && productsCount != 0 ){
        res.status(500).json({success : false})
    }
    res.status(200).json({ success : true , productsCount : productsCount});
})
//COUNT PRODUCTS ON SALE
router.get('/get/count/onsale' , async (req , res)=>{
    const productsCount = await Product.find({isOnSale : true}).countDocuments();

    if(!productsCount && productsCount != 0) {
        res.status(500).json({success: false})
    } 

    res.status(200).json({success : true ,  productsCount : productsCount});
})


//// GET ALL , GET BY ID , PUT , POST , DELETE
//Get ALL products
router.get(`/`, async (req, res) =>{
    let filter = {};
    if(req.query.categories){
        filter = {category :  req.query.categories.split('+')};
    }

    const productList = await Product.find(filter);

    if(!productList) {
        res.status(500).json({success: false})
    } 
    res.status(200).send(productList);
})

// get product by ID
router.get('/:id' , async (req , res)=>{
    if (!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send('Invalid product Id');
    }
    const product = await Product.findById(req.params.id);

    if (!product){
        res.status(500).json({message : 'The product with this Id is not found'})
    }
    res.status(200).send(product);

})

//POST
router.post(`/`, uploadOptions.single('image') , async (req, res) =>{
    const category = await Category.findById(req.body.category);
    if(!category){
        return res.status(400).send('Invalid Category'); 
    }

    const reqFile = req.file;
    if(!reqFile){
        return res.status(400).send('No Image Uploaded'); 
    }
    
    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`

    let product = new Product({
        name: req.body.name ,
        description: req.body.description,
        image: `${basePath}${fileName}`,
        price: req.body.price,
        category:req.body.category,
        countInStock:req.body.countInStock,
        isOnSale: req.body.isOnSale,
        colors: req.body.colors,
        sizes: req.body.sizes
    })

    product = await product.save();
    if (!product){
        return res.status(500).send('The product cannot be created');
    }

    return res.status(200).send(product);
})

//put  
router.put('/:id' , uploadOptions.single('image') , async (req , res)=>{
    if (!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send('Invalid product Id');
    }
    const category = await Category.findById(req.body.category);
    if(!category){
        return res.status(400).send('Invalid Category');
    }
    
    const oldProduct = await Product.findById(req.params.id);
    if(!product){
        return res.status(400).send('Invalid Product');
    }

    const file = req.file;
    let imagePath;

    if(file){
        const fileName = file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/` ;
        imagePath = `${basePath}${fileName}`;
    }
    else{
        imagePath = oldProduct.image;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
        {
            name: req.body.name ,
            description: req.body.description,
            image: imagePath,
            price: req.body.price,
            category:req.body.category,
            countInStock:req.body.countInStock,
            isOnSale: req.body.isOnSale,
            colors: req.body.colors,
            sizes: req.body.sizes
        },
        {new : true}
    )
    
    if (!updatedProduct){
        return res.status(500).send('The product cannot tbe updated')
    }

    res.status(200).send(updatedProduct);
})

// DELETE  
router.delete('/:id' , (req , res)=>{
    if (!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send('Invalid product Id');
    }
    Product.findByIdAndRemove(req.params.id)
    .then(p=>{
        if(p){
            return res.status(200).json({success : true , message : 'the product deleted successfully'});
        }
        else{
            res.status(404).json({success : false , message : 'product not found'});
        }
    })
    .catch(err=>{
        return res.status(500).json({success : false , error : err});
    })
})

// GALLERY API
router.put('/gallery/:id' , uploadOptions.array('images' , 10 ) , async (req , res)=>{
    if (!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send('Invalid product Id');
    }
    
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
    const files = req.files;
    if (files)
    {
        files.map(file => {
            imagesPaths.push(`${basePath}${file.filename}`);
        })
    }

    const product = await Product.findByIdAndUpdate(
    req.params.id,
        {
            images : imagesPaths
        },
        {new : true}
    )
    
    if (!product){
        return res.status(500).send('The product cannot tbe updated')
    }

    res.status(200).send(product);
})



module.exports = router;



