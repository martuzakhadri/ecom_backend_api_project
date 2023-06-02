const express = require('express')
const router = express.Router()
const { User } = require('../models/user')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


router.get('/', async (req, res) => {
    const UserList = await User.find().select('-passwordHash')
    if (!UserList) {
        return res.status(404).json("No UserList found")
    }
    res.send(UserList)
})


router.get('/:id', async (req, res) => {
    const user = await User.findById(req.params.id).select('-passwordHash')
    if (!user) {
        return res.status(500).json({ success: true, message: 'user not found' })
    }
    res.status(200).send(user)
})

// router.post('/', async (req, res) => {
    
//     let user = new User({
//         name: req.body.name,
//         email: req.body.email,
//         passwordHash: req.body.passwordHash,
//         phone: req.body.phone,
//         isAdmin: req.body.isAdmin,
//         street: req.body.street,
//         apartment: req.body.apartment,
//         zip: req.body.zip,
//         city: req.body.city,
//         country: req.body.country,
//     })
//     user = await user.save();

//     if (!user)
//         return res.status(400).send('the user cannot be created!')

//     res.send(user);
// })



router.post('/', async (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash:req.body.passwordHash,
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    street: req.body.street,
    apartment: req.body.apartment,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country,
  });

  user = await user.save();

  if (!user) {
    return res.status(400).send('The user cannot be created!');
  }

  res.send(user);
});


router.put('/:id', async (req, res) => {
    const userExist = await User.findById(req.params.id)
    let newPassword
    if (req.body.passwordHash) {
        newPassword = req.body.passwordHash
    }
    else {
        newPassword = userExist.passwordHash
    }
    const user = await User.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        email: req.body.email,
        passwordHash: newPassword,
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })
    if (!user) {
        return res.status(400).send("the user cannot be updated")
    }
    res.send(user)

})


router.post('/login', async (req,res) => {
    const user = await User.findOne({email: req.body.email})
    const secret = process.env.SECRET;
  
    if(!user) {
        return res.status(400).send('The user not found');
    }

    if(user) {
       
              
        res.status(200).send(user) 
    } else {
       res.status(400).send('password is wrong!');
    }

    
})



router.post('/register', async (req,res)=>{
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash:bcrypt.hashSync(req.body.passwordHash,10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })
    user = await user.save();

    if(!user)
    return res.status(400).send('the user cannot be created!')

    res.send(user);
})

module.exports = router;
