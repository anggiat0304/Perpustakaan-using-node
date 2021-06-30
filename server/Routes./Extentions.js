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
const listOfBooks = await ListOfBooks.findOne({where:{tag:tag}});
    const member = await Members.findOne({where:{id:idMember}});
    if(!listOfBooks) res.json('Tag Buku tidak terdaftar')
    else if(listOfBooks){const idBook = listOfBooks.id
    
    const loans = await Loans.findOne({where:{ListOfBookId:idBook,status:!'kembali'}});
    const bukuid = listOfBooks.BookId
    const book = await Books.findOne({where:{id:bukuid}});
     if(!loans) res.json('tag tidak terdaftar di daftar peminjaman atau telah dikembalikan')
    else if(listOfBooks.status=="free") res.json('Buku telah kembali')
    else if(loans.status=="late") res.json('Buku telah terlambat dikembalikan silahkan hubungi admin')
    else {
            if (listOfBooks.extention < 4) {
                Extentions.create({
                    renewalDate: new Date(),
                    ListOfBookId : idBook,
                    LoanId:loans.id,
                    MemberId:idMember,
                    returnLimit:addDays(new Date(),member.posisition)
                })
            
                Loans.update({status:'diperpanjang',limitDate:addDays(new Date(loans.limitDate),member.posisition)},{where:{id:loans.id}});
                ListOfBooks.update({extention:listOfBooks.extention+1},{where:{id:idBook}});
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
                    hingga pada tanggal ${addDays(new Date(),member.posisition)}`
                };
                
                transporter.sendMail(mailOptions, (err, info) => {
                    if (err) throw err;
                    console.log('Email sent: ' + info.response);
                });
                 res.json('SUCCESS')
            }else{
                res.json('Perpanjangan sudah melebihi batas')
            }
         }
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
    const id = req.params.id
    const peminjaman = await Loans.findOne({where:{id:id}});
    
})


module.exports = router