const express = require('express')
const { Order } = require('../models/order')
const { OrderItem } = require('../models/order_item')
const router = express.Router()

router.get('/', async (req, res) => {
    const orderList = await Order.find()
    .populate('user','name')
    .populate({path:'orderItems',populate:'product'})
    
    
    //.sort({'dateCreated': -1}) get newest ordr
    if (!orderList) {
        return res.status(404).json("No orderList found")
    }
    res.send(orderList)
})

router.get('/:id', async (req, res) => {
    const product = await Order.findById(req.params.id).populate('category')
    if (!product) {
        return res.status(404).json("No product found")
    }
    res.send(product)
})

router.post('/', async (req, res) => {
    const orderItemIds = Promise.all(req.body.orderItems.map(async orderItem => {
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product,
        })
        newOrderItem = await newOrderItem.save();
        return newOrderItem._id;
    }))

    const orderItemIdsresolved = await orderItemIds;
    //console.log(orderItemIdsresolved)

    const totalprices = Promise.all(orderItemIdsresolved.map(async(orderItem)=>{
        const product = await OrderItem.findById(orderItem).populate('product','price');
        const totalprice = product.OrderItem.price*orderItem.quantity;
        return totalprice
    }))

    const totalPrice = (await totalprices).reduce((a,b)=>{a +b,0})

    let order = new Order({
        orderItems: orderItemIdsresolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress1: req.body.shippingAddress1,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice:totalPrice,
        user: req.body.user,
    })
   order = await order.save();
    if (!order) {
        return res.status(400).send("the order cannot be created")
    }
    res.send(order)
}
)


router.put('/:id', async (req, res) => {
     const order = await Order.findByIdAndUpdate(req.params.id, 
        {
      status:req.body.status
    },
        { new: true }
    )
   
    if (!order)
        return res.status(500).send('The order cannot be updated')

    res.send(order);
})

router.delete('/:id', (req, res) => {
    Order.findByIdAndRemove(req.params.id).then( async order => {
        if (order) {
              await order.orderItems.map(async orderItem=>{
                await orderItem.findByIdAndRemove(orderItem)
            })            
            return res.status(200).json({ success: true, message: 'order deleted' })
        } else {
            return res.status(404).json({ success: false, message: 'order cannot be  deleted' })
        }
    }).catch(err => {
        return res.status(400).json({ success: false, message: 'order not found' })
    })
})


router.get('/get/totalsales',async(req,res)=>{
    const totalsales= await Order.aggregate([
        {$group:{_id:null,totalsales:{$sum:'$totalPrice'}}}
    ])
    if(!totalsales){
        return res.status(400).send('the order sales cannot be generated')
    }
    res.send(totalsales)
})

router.get(`/get/count`,async(req,res)=>{
    const OrderCount = await Order.find().countDocuments();

    if(!OrderCount){
        res.status(500).json({ success: false})
    }
    res.send(
        {
            success: true,
            count: OrderCount
        }
    )
})


router.get('/get/userorders:userid', async (req, res) => {
    const orderList = await Order.find({user:req.params.userid}).populate(
        {path:'orderItems', populate:{path:'product',populate:'category'}}.sort({'dateCreated':-1}))
    .populate({path:'orderItems',populate:'product'})
    
    //.sort({'dateCreated': -1}) get newest ordr
    if (!orderList) {
        return res.status(404).json("No orderList found")
    }
    res.send(orderList)
})

module.exports = router