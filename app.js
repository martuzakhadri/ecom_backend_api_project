const express = require('express')
const app = express()
const mongoose = require('mongoose');
const morgan = require('morgan')
const cors = require('cors')

const productsRouter = require("./routes/products")
const categoriesRouter= require("./routes/categories")
const ordersRouter = require("./routes/orders")
const usersRouter = require("./routes/users")




require('dotenv/config')
//const authJwt = require('./helpers/jwt')
app.use(cors());
app.options('*',cors())

//middleware
app.use(express.json());
app.use(morgan('tiny'));
//app.use(authJwt());



const api = process.env.API_URL

app.use(`${api}/products`,productsRouter)
app.use(`${api}/categories`,categoriesRouter)
app.use(`${api}/orders`,ordersRouter)
app.use(`${api}/users`,usersRouter)









mongoose.connect(process.env.CONNECTION_STRING)
.then(()=>{
   console.log('data base is connected')
})
.catch((err)=>{
   console.log(err)
})
app.listen(3000,()=>{
    console.log(api)
    console.log('listening on port 3000')
})