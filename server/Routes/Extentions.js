const express = require('express')
const app = express();
const router = express.Router()
const {Extentions,Loans,ListOfBooks,Members,Books} = require('../models');
var nodemailer = require('nodemailer');
const bcrypt = require("bcrypt");
const multer = require("multer")
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); 

const limit =(status)=>{
    if(status == 'Mahasiswa') var days = 4;
    else{
        var days = 6
    }
    return days
}

const addDays=(theDate, status)=> {

if (status === "Mahasiswa") {
    var days = 4;
}else{
    var days = 7;
}
return new Date(theDate.getTime() + days*24*60*60*1000);
}


router.post('/',async (req,res)=>{
        const {tag,idMember} = req.body;
        try {
            const listOfBooks = await ListOfBooks.findOne({where:{tag:tag}})
            const peminjaman = await Loans.findOne({where:{ListOfBookId:listOfBooks.id,status:['dipinjam','diperpanjang']}})
            const member = await Members.findOne({where:{id:idMember}});
            const book = await Books.findOne({where:{id:listOfBooks.BookId}})
            if (listOfBooks.extention < 5) {
            Extentions.create({
                renewalDate : new Date(),
                returnLimit : addDays(new Date(),member.posisition),
                ListOfBookId : listOfBooks.id,
                LoanId : peminjaman.id,
                MemberId : idMember
            })
            Loans.update({
                status:'diperpanjang',
                limitDate:addDays(peminjaman.limitDate, member.posisition)},{where:{ListOfBookId:listOfBooks.id,status:['dipinjam','diperpanjang']}})
            ListOfBooks.update({extention:listOfBooks.extention+1},{where:{id:listOfBooks.id}})

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
                subject: 'Perpanjangan',
                text: 'Perpanjangan Buku',
                html :`Hai ${member.name}, anda baru saja melakukan perpanjangan buku ${book.title} di perpustakaan
                hingga pada tanggal ${addDays(peminjaman.limitDate,member.posisition)}`
            };
            
            transporter.sendMail(mailOptions, (err, info) => {
                if (err) throw err;
                console.log('Email sent: ' + info.response);
            });
             res.json('SUCCESS')
            }else{
                res.json('Perpanjangan Sudah melebihi batas')
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
       const Peminjaman = await Extentions.findAll({where:{MemberId:idMember}});
          const idBuku = Peminjaman[i++]['ListOfBookId'];
          const ListOfBook = await ListOfBooks.findOne({where:{id:idBuku}})
          const Buku = await Books.findOne({where:{id:ListOfBook.BookId}})
          res.json({Buku,Peminjaman})
   } catch (error) {
       res.json(error.messages)
   }
})
router.get('/All',async(req,res)=>{
    const {tag} = req.query
    try {
        let i = 0;
        
       const Peminjaman = await Extentions.findAll();
          const idBuku = Peminjaman[i++]['ListOfBookId'];
          const ListOfBook = await ListOfBooks.findOne({where:{id:idBuku}})
          const Buku = await Books.findOne({where:{id:ListOfBook.BookId}})
          res.json({Buku,Peminjaman})
   } catch (error) {
       res.json(error.messages)
   }
})
router.get('/:id',async (req,res)=>{
    try {
        const id = req.params.id
    const peminjaman = await Loans.findOne({where:{id:id}});
    const member = await Members.findOne({id:peminjaman.MemberId})
    Loans.update({status:'diperpanjang',limitDate:addDays(peminjaman.limitDate,member.posisition)},{where:{id:id}});
    res.json('ok')
    } catch (error) {
        res.json(error.message)
    }
})


module.exports = router