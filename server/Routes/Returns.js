const express = require('express')
const app = express();
const router = express.Router()
const {Loans,Returns,ListOfBooks,Members,Books,Dropboxs} = require('../models');
var nodemailer = require('nodemailer');
const bcrypt = require("bcrypt");
const multer = require("multer")
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); 


router.post('/',async (req,res)=>{
    const {tag,idMember} = req.body;
    
  
    const listOfBooks = await ListOfBooks.findOne({where:{tag:tag}});
    const member = await Members.findOne({where:{id:idMember}});
    if(!listOfBooks) res.json('Tag Buku tidak terdaftar')
    else if(listOfBooks){const idBook = listOfBooks.id
    
    const loans = await Loans.findOne({where:{ListOfBookId:idBook,status:['dipinjam','diperpanjang']}});
    const bukuid = listOfBooks.BookId
    const book = await Books.findOne({where:{id:bukuid}});
     if(!loans) res.json('tag tidak terdaftar di daftar peminjaman')
    else if(listOfBooks.status=="free") res.json('Buku telah kembali')
    else if(loans.status=="late") res.json('Buku telah terlambat dikembalikan silahkan hubungi admin')
    else {
            Returns.create({
                returnDate: new Date(),
                ListOfBookId : idBook,
                LoanId:loans.id,
                MemberId:idMember,
            })
            Loans.update({status:'kembali'},{where:{id:loans.id}});
            ListOfBooks.update({status:'free',extention:null},{where:{id:idBook}});
            Members.update({loanAmount:listOfBooks.loanAmount-1},{where:{id:idMember}});
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'anggiatpangaribuan12@gmail.com',
                    pass: 'sitoluama2'
                }
            });
            
            
            var mailOptions = {
                from: 'anggiatpangaribuan12@gmail.com',
                to: member.email,
                subject: 'Pengembalian',
                text: 'Pengembalian Buku',
                html :`Hai ${member.name}, anda baru saja melakukan pengembalian buku ${book.title} di perpustakaan
                pada tanggal ${new Date()}`
            };
            
            transporter.sendMail(mailOptions, (err, info) => {
                if (err) throw err;
                console.log('Email sent: ' + info.response);
            });
             res.json('SUCCESS')
         }
        }
})
router.post('/Dropbox',async (req,res)=>{
    const {id,idMember} = req.body;
    try {
        const loans = await Loans.findOne({where:{id:id}});
        const listOfBooks = await ListOfBooks.findOne({where:{id:loans.ListOfBookId}})
        const member = await Members.findOne({where:{id:idMember}})
         if(!loans) res.json('tag tidak terdaftar di daftar peminjaman')
        else if(listOfBooks.status=="free") res.json('Buku telah kembali')
        else if(loans.status=="late") res.json('Buku telah terlambat dikembalikan silahkan hubungi admin')
        else {
            Returns.create({
                returnDate: new Date(),
                ListOfBookId : loans.ListOfBookId,
                LoanId: id,
                MemberId:idMember,
            })
            Loans.update({status:'kembali',DropboxId:null},{where:{id:id}});
            ListOfBooks.update({status:'free',extention:null},{where:{id:listOfBooks.id}});
            Members.update({loanAmount:member.loanAmount-1},{where:{id:idMember}});
            Dropboxs.update({sumBook:loans.sumBook-1},{where:{id:loans.DropboxId}});
            res.json('success')    
    }
     } catch (error) {
         res.json(error.message)
     }

    })

router.get('/Member',async(req,res)=>{
    const {tag} = req.query
    try {
        let i = 0;
        const member = await Members.findOne({where:{tag:tag}});
        const idMember = member.id
        const Pengembalian = await Returns.findAll(
            {where:{MemberId:idMember},
             include : [
                 {model:ListOfBooks,require:true,
                    include:[{model:Books,require:true}
                    ]},{model:Loans,require:true}
            ]});
           res.json(Pengembalian)
   } catch (error) {
       res.json(error.messages)
   }
})
router.get('/Late',async(req,res)=>{
    const {id} = req.query
    try {
        const loans = await Loans.findOne({where:{id:id}});
        Loans.update({status:'kembali'},{where:{id:id}});
        ListOfBooks.update({status:'free',extention:null},{where:{id:loans.ListOfBookId}});
        Returns.create({
            returnDate: new Date(),
            ListOfBookId : loans.ListOfBookId,
            LoanId: id,
            MemberId:loans.MemberId,
        })
       res.json('Success');
   } catch (error) {
       res.json(error.messages)
   }
})
router.get('/All',async(req,res)=>{
    try {
        let i = 0;
        const Pengembalian = await Returns.findAll({
            include : [
                {model:ListOfBooks,require:true,
                   include:[{model:Books,require:true}
                   ]}  ,{model:Members,require:true}
                   ,{model:Loans,require:true}
               ]}
               );
        res.json(Pengembalian)
   } catch (error) {
       res.json(error.messages)
   }
})


module.exports = router