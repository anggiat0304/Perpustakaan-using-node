const express = require('express')
const app = express();
const router = express.Router()
const {Books,Dropboxs,ListOfBooks,Loans,Members} = require('../models');
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
router.get('/coba',async (req,res)=>{
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
router.get('/Detail',async (req,res)=>{
    const {id} = req.query
    try {
    const Peminjaman =  await Loans.findAll({where:{status:'box',DropboxId:id},
                        include:[{model:ListOfBooks,require:true,
                            include:[{model:Books, require:true}
                            ]},{model:Members,require:true}]
                        });
    res.json(Peminjaman)
    } catch (error) {
        res.json(error.message)
    }
})

router.post('/Return',async(req,res)=>{
    const {id,tag} = req.body
    try {
        const listOfBooks = await ListOfBooks.findOne({where:{tag:tag}});
        const dropbox = await Dropboxs.findOne({where:{id:id}});
        const peminjaman = await Loans.findOne({
            where:{ListOfBookId:listOfBooks.id,status:['dipinjam','diperpanjang']},
            include: [{model:Members,require:true},
                    {model:ListOfBooks,require:true,include:[{model:Books,require:true}]}]
        });
        if (peminjaman != null) {
            Loans.update({status:'box',DropboxId:id},{where:{id:peminjaman.id}})
        Dropboxs.update({sumBook:dropbox.sumBook+1},{where:{id:dropbox.id}})
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'anggiatpangaribuan12@gmail.com',
                pass: 'sitoluama2'
            }
        });
        
        
        var mailOptions = {
            from: 'anggiatpangaribuan12@gmail.com',
            to: peminjaman.Member.email,
            subject: 'Pengembalian',
            text: 'Pengembalian Buku',
            html :`Hai ${peminjaman.Member.name}, anda baru saja melakukan pengembalian buku 
            ${peminjaman.ListOfBook.Book.title} ke dalam 
            dropbox ${dropbox.name}
            pada tanggal ${new Date()}` 
        };
        
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) throw err;
            console.log('Email sent: ' + info.response);
            
            res.json('SUCCESS')
        });
        }else{
            const peminjaman2 = await Loans.findOne({
                where:{ListOfBookId:listOfBooks.id},
                include: [{model:Members,require:true},
                        {model:ListOfBooks,require:true,include:[{model:Books,require:true}]}]
            });
            if(peminjaman2.status == "late") res.json("Buku sudah terlambat silahkan hubungi petugas perpustakaan")

            else if(peminjaman2.status = "kembali") res.json("Buku telah berhasil dikembalikan")
        }
      
    } catch (error) {
       res.json(error.messages)    
    }
})
 


module.exports = router