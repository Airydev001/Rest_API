const express = require('express');
const app = express();

const bcrypt = require('bcrypt');
const jwtoken = require('jsonwebtoken');
const newSetUser = require('../models/newSetUser');
const mongoose = require("mongoose");
const config = require("../config/private");

const router = express.Router();

router.get('/',async(req,res)=>{
//res.send('Getting connected');
try {
   const usersModify= await newSetUser.find()
   res.json(usersModify);
}catch (error){
   res.send(`Error ${error}`)
}
})
router.get('/:id',async(req,res)=>{
    //res.send('Getting connected');
    try {
       const userModify= await newSetUser.findById(req.params.id);
       res.json(userModify);
    }catch (error){
       res.send(`Error ${error}`)
    }
    })
router.post('/signup',async(req,res)=>{
     newSetUser.find({email: req.body.email}).exec()
     .then( user => {
        if (user.length >= 1){
        return res.status(409).json({
          message : 'Mail already exists',
        })
    } else {
        
        bcrypt.hash(req.body.password,10,(err,hash)=>{
            if(err){
                return res.status(500).json({
                    "Whoops!":err,
                })
            } else{
                const user = new newSetUser({
                    _id:  new mongoose.Types.ObjectId(),
                    name : req.body.name,
                    email: req.body.email,
                    password: hash
            });
            //in other to reflect in the database
            user.save().then(
                results => {
                    res.status(201).json(
                    {
                        message: "User Account created Successfully "
                    }
                    )
                }
            ).catch(err=>{
                console.log(err);
                res.status(500).json({
                    error: err
                });
            })
        }
        });
    }
     })
   
    

  });

  /*try{
     const resp = await user.save();
     res.json(resp)
  } catch(error){
    res.send("Whoops Error " + error);
  }*/

router.patch('/:id', async(req,res)=>{
try{
    const useModify = await newSetUser.findById(req.params.id);
    useModify.sub = req.body.sub
    const amends = await useModify.save()
    res.json(amends);
} catch(err){
    res.send("Error");
}
})

router.delete('/:id',async(req,res,next)=>{
    newSetUser.remove(req.params.id).exec().then(
        res.status(410).json({
            message:"Gotcha User deleted"
        })
    ).catch((err)=>{
      res.json({
        error:err,
      })
    });
    req.body.save();
})

router.post('/signin',(req,res,next)=>{
    newSetUser.find({email:req.body.email})
    .exec()
    .then(user => {
       if(user.length < 1){
        return res.status(401).json({
            message:`Unauthorized`,
        });
       }
       bcrypt.compare(req.body.password, user[0].password,(err,result)=>{
         if(err){
            return res.status(401).json({
                message:"Authentication  Failed"
            })
         }
         if(result){
           const token = jwtoken.sign({
                email:user[0].email,
                userId : user[0]._id
            },
               config["JWT_KEY"],
            {
                expiresIn : "1h"
            }
            )
            return res.status(200).json({
                message:'Authentication Success',
                token:token
            })
         }
         res.status(401).json({
            message:"Authentication failed",
         })
       })
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({
            error:err,
        })
    })
     });

/*const logIn = require('./signin');
app.use('/signin',logIn);*/
module.exports=router;