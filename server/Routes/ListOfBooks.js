const express = require('express')
const app = express();
const router = express.Router()
const {ListOfBooks,Books} = require('../models');
var nodemailer = require('nodemailer');
const bcrypt = require("bcrypt");
const multer = require("multer")
var bodyParser = require('body-parser');
const path = require('path')
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); 


    
router.get('/',async (req,res)=>{
    const {BookId} = req.query;
    const listOfBooks = await ListOfBooks.findAll({where:{BookId:BookId}});
    if (listOfBooks == null) {
        res.json(null)
    }else{
        res.json(listOfBooks)
    }
})
router.get('/check',async (req,res)=>{
    const {id} = req.query;

    try {
        const Buku = await Books.findOne({where:{id:id}});
        const listOfBooks = await ListOfBooks.findOne({where:{BookId:id,status:'free'}});
        if (listOfBooks != null) {
            res.json(`
            Buku masih tersisa, silahkan lihat : \n
                Judul       : ${Buku.title} \n
                Pengarang   : ${Buku.author} \n
                Penerbit    : ${Buku.publisher} \n
                Deskripsi   : ${Buku.description} \n
                Lokasi      : ${Buku.location}`); 
        }else{
            res.json('Buku tidak tersedia')
        }
    } catch (error) {
        res.json(error.message)
    }
})
router.post('/addTag',async (req,res)=>{
    const {id , tag} = req.body
    const listOfBooks = await ListOfBooks.findOne({where:{tag:tag}});
    if (listOfBooks) {
        res.json("not null");
    }else{
        await ListOfBooks.create({
            tag:tag,
            BookId:id,
            status:'free',
        })
        res.json("Success");
    }
})
router.get('/deleteTag',async (req,res)=>{
    const {Id} = req.query
    const deleteTag = await ListOfBooks.destroy({where:{id:Id}});
    if (deleteTag) {
        res.json(200);
    }else{
        res.json(400);
    }
})
 

module.exports = router