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
    if(status == 'Mahasiswa' && status == 'mahasiswa') var days = 4;
    else{
        var days = 6
    }
    return days
}

const addDays=(theDate, status)=> {

if (status === "Mahasiswa" || status == 'mahasiswa') {
    var days = 4;
}else{
    var days = 7;
}
return (theDate + days*24*60*60*1000);
}


router.post('/',async (req,res)=>{
        const {tag,idMember} = req.body;
        try {
            const listOfBooks = await ListOfBooks.findOne({where:{tag:tag}})
            const peminjaman = await Loans.findOne({where:{ListOfBookId:listOfBooks.id,status:['dipinjam','diperpanjang']}})
            const member = await Members.findOne({where:{id:idMember}});
            const book = await Books.findOne({where:{id:listOfBooks.BookId}})
            if (listOfBooks.extention < 3) {
            Extentions.create({
                renewalDate : new Date(),
                returnLimit : addDays(Date.parse(peminjaman.limitDate), member.posisition),
                ListOfBookId : listOfBooks.id,
                LoanId : peminjaman.id,
                MemberId : idMember
            })
            Loans.update({
                status:'diperpanjang',
                limitDate:addDays(Date.parse(peminjaman.limitDate), member.posisition)},{where:{ListOfBookId:listOfBooks.id,status:['dipinjam','diperpanjang']}})
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
       const Perpanjangan = await Extentions.findAll(
           {where:{MemberId:idMember},
           
            include : [
                {model:ListOfBooks,require:true,
                   include:[{model:Books,require:true}
                   ]}  
                   ,{model:Loans,require:true}
           ]});
          res.json(Perpanjangan)
   } catch (error) {
       res.json(error.message)
   }
})
router.get('/All',async(req,res)=>{
    const {tag} = req.query
    try {
        let i = 0;
        
        const Perpanjangan = await Extentions.findAll({
            include : [
                {model:ListOfBooks,require:true,
                   include:[{model:Books,require:true}
                   ]}  ,{model:Members,require:true}
                   ,{model:Loans,require:true}
               ]}
               );
        res.json(Perpanjangan)
   } catch (error) {
       res.json(error.messages)
   }
})
router.get('/:id',async (req,res)=>{
    const id = req.params.id
    try {
    const peminjaman = await Loans.findOne({where:{id:id},include:{model:ListOfBooks,require:true,
        include : {model:Books,require:true}
    }});
    const member = await Members.findOne({where:{id:peminjaman.MemberId}})
    const listOfBooks = await ListOfBooks.findOne({where:{id:peminjaman.ListOfBookId}});
    if (listOfBooks.extention < 4) {
        Loans.update({status:'diperpanjang',
        limitDate:addDays(Date.parse(peminjaman.limitDate), member.posisition)},
        {where:{id:peminjaman.id}});
        ListOfBooks.update({extention:listOfBooks.extention +1},{where:{id:listOfBooks.id}});
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
            html :`Hai ${member.name}, anda baru saja melakukan perpanjangan buku ${peminjaman.ListOfBook.Book.title} di perpustakaan
            hingga pada tanggal ${peminjaman.limitDate}`
        };
        
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) throw err;
            console.log('Email sent: ' + info.response);
        });
         res.json('SUCCESS')    
    }else{
        res.json("Sudah melebihi batas peminjaman");
    }

    
    } catch (error) {
        res.json(error.message)
    }
})


module.exports = router