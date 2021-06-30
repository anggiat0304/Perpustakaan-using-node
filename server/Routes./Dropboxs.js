const express = require('express')
const app = express();
const router = express.Router()
const {Books,Dropboxs,ListOfBooks,Loans} = require('../models');
var nodemailer = require('nodemailer');
const bcrypt = require("bcrypt");
const multer = require("multer")
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); 


router.get('/',async (req,res)=>{
    const Dropbox = await Dropboxs.findAll();
    res.json(Dropbox)
})
router.post('/',async (req,res)=>{
    const {name} = req.body
    const Dropbox =  await Dropboxs.create({name:name});
    res.json('success')
})
router.get('/Delete',async (req,res)=>{
    const {id} = req.query
    const Dropbox =  await Dropboxs.destroy({where:{id:id}});
    res.json('success')
})

router.post('/Return',async(req,res)=>{
    const {id,tag} = req.body
    try {
        const listOfBooks = await ListOfBooks.findOne({where:{tag:tag}});
        const dropbox = await Dropboxs.findOne({where:{id:id}});
        const peminjaman = await Loans.findOne({where:{ListOfBookId:listOfBooks.id}})
        res.json(peminjaman);
        if(listOfBooks.status == 'free' || peminjaman.status=='kembali') res.json('buku telah kembali')
        else if(peminjaman.status == 'late') res.json('Anda Tidak dapat mengembalikan Buku Karena Telat');
        else{
        Loans.update({status:'box',DropboxId:id},{where:{ListOfBookId:listOfBooks.id}})
        Dropboxs.update({sumBook:dropbox.sumBook+1},{where:{id:dropbox.id}})
        res.json('ok')
        }
    } catch (error) {
       res.json(error.messages)    
    }
})
 



module.exports = router