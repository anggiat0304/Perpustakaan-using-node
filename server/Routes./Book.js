const express = require('express')
const app = express();
const router = express.Router()
const {Books} = require('../models');
var nodemailer = require('nodemailer');
const bcrypt = require("bcrypt");
const multer = require("multer")
var bodyParser = require('body-parser');
const { query } = require('express');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); 


const storage = multer.diskStorage({
    destination : (req,file,cb)=>{
        cb(null,'images')
    },
    filename: function(req, file, cb){
        cb(null, file.fieldname + '-' + Date.now() +
        path.extname(file.originalname));
    }
});

const upload = multer({
    storage : storage
    }).single('picture');

router.post('/addPicture', function(req, res){
    const BookId = req.query
        upload(req, res, err => {
            if (err) throw err
            const add =  Books.update({images:req.file.filename})
            res.json('ok')
         });
     });



router.post("/AddBook",async(req,res)=>{
    const {
    judul,
    subjek,
    edisi,
    pengarang,
    bahasa,
    deskripsi,
    jenis,
    penerbit,
    isbn,
    tahun,
    keaslian,
    lokasi,
    } = req.body
    
   
    const checkISBN = await Books.findOne({where :{isbn:isbn}});

    if (checkISBN) {
        res.json("isbn");
    }else{
        await Books.create({
           title : judul,
           isbn: isbn,
           publicationYear: tahun,
           author: pengarang,
           location:lokasi,
           language:bahasa,
           type:jenis,
           subject:subjek,
           publisher:penerbit,
           description: deskripsi,
           authencity:keaslian,
           edition: edisi,
       })
       res.json("SUCCESS");
    }

 })
router.get("/Books",async(req,res)=>{
    const AllBook = await Books.findAll();
    res.json(AllBook);
 })
 

 
 router.get('/BookDetail',async (req,res)=>{
    const {id} = req.query;
    const book = await Books.findOne({where:{id:id}});
    res.json(book);
})
 



module.exports = router