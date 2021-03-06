const mongoose = require('mongoose');
const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');
const authJwt = require('./helpers/jwt')
const errorHandler = require('./helpers/error-handler')
require('dotenv/config');


//middleware
app.use(cors());
app.use(express.json());
app.use(morgan('tiny'));
app.use(authJwt());
app.use('/public/uploads' , express.static(__dirname + '/public/uploads'));
app.use(errorHandler);


//Routes
const categoriesRoutes = require('./routes/categories');
const productsRoutes = require('./routes/products');
const usersRoutes = require('./routes/users');
const ordersRoutes = require('./routes/orders');
const favoriteRoutes = require('./routes/favorites')
const cartRoutes = require('./routes/cart.js')

const api = process.env.API_URL;

app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);
app.use(`${api}/favorite` , favoriteRoutes);
app.use(`${api}/cart` , cartRoutes);

//Database
mongoose.connect(process.env.CONNECTION_STRING ,{
    dbName : process.env.DB_NAME
})
.then(()=>{
    console.log('Database Connection is ready...')
})
.catch((err)=> {
    console.log(err);
})

const PORT = process.env.PORT || 3000;
//Server
app.listen(PORT, ()=>{

    console.log('server is running http://localhost:3000');
})