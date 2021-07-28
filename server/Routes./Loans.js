const express = require('express')
const app = express();
const router = express.Router()
const {Loans,ListOfBooks,Members,Books,Returns} = require('../models');
var nodemailer = require('nodemailer');
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); 


router.get('/test2',async (req,res)=>{
    var i = 0
    const {id} = req.query
    try {
        const Peminjaman = await Loans.findOne({where:{id:id},
            include : [
               {model:ListOfBooks,require:true,
                  include:[{model:Books,require:true}
                  ]},{model:Members,require:true}
          ]
           });
    
           var transporter = nodemailer.createTransport({
               service: 'gmail',
               auth: {
                   user: 'anggiatpangaribuan12@gmail.com',
                   pass: 'sitoluama2'
               }
           });
           link=`http://192.168.137.1:3001/Extentions/${Peminjaman.id}`;
           
           var mailOptions = {
               from: 'anggiatpangaribuan12@gmail.com',
               to: Peminjaman.Member.email,
               subject: 'Reminder Waktu Peminjaman',
               text: 'Reminder Waktu Peminjaman Peminjaman Buku',
               html :`Hai ${Peminjaman.Member.name}, waktu batas pengembalian buku ${Peminjaman.ListOfBook.Book.title} tinggal 1 hari lagi. Harap Anda
                     segera mengembalikan atau anda dapat melakukan perpanjangan dengan mengklik <p><a href=${link}>Perpanjang</a></p>
                       `
           };
           
           transporter.sendMail(mailOptions, (err, info) => {
               if (err) throw err;
               console.log('Email sent: ' + info.response);
               res.json("ok")
           });
        
    } catch (error) {
        res.json(error.message)
    }
})
router.get('/test',async (req,res)=>{
    const {id} = req.query
    try {
        const Peminjaman = await Loans.findOne(
            {
            where:{id:id},
            include : [
               {model:ListOfBooks,require:true,
                  include:[{model:Books,require:true}
                  ]},{model:Members,require:true}
          ]
           });
        
            Loans.update({status:'late'},{where:{id:id}});

        
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'anggiatpangaribuan12@gmail.com',
                pass: 'sitoluama2'
            }
        });
        link=`http://192.168.137.1:3001/Extentions/${Peminjaman.id}`;
        
        var mailOptions = {
            from: 'anggiatpangaribuan12@gmail.com',
            to: Peminjaman.Member.email,
            subject: 'Pemberitahuan Anda telah terlambat',
            text: 'Keterlambatan Pengembalian Buku',
            html :`Hai ${Peminjaman.Member.name}, waktu batas pengembalian buku ${Peminjaman.ListOfBook.Book.title} telah lewat kini 
                    status peminjaman anda telah terlambat
                    `
        };
        
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) throw err;
            console.log('Email sent: ' + info.response);
            res.json("ok")
        });
    } catch (error) {
        res.json(error.message)
    }
})


const limit =(status)=>{
        if(status == 'mahasiswa') return 4;

        return 7
}

const addDays=(theDate, status)=> {
    
    if (status == "Mahasiswa" || status == "mahasiswa") {
        var days = 7;
    }else{
        var days = 14;
    }
    return new Date(theDate.getTime() + days*24*60*60*1000);
}

router.post('/',async (req,res)=>{
    const {tag,idMember} = req.body;

    const listOfBooks = await ListOfBooks.findOne({where:{tag:tag}});   
    const Member = await Members.findOne({where:{id:idMember}});
    

    if(!listOfBooks || !Member) res.json('Tag Tidak Terdaftar')
    else if(Member.loanAmount > 3) res.json('Sudah Mencapai Batas Peminjaman')
    else if(listOfBooks.status == 'dipinjam') res.json('Buku telah dipinjam')
    else{
        const BookId = listOfBooks.BookId
    const book = await Books.findOne({where:{id:BookId}})
    const name = Member.name
    const title = book.title
        Loans.create({
            ListOfBookId: listOfBooks.id,
            status:'dipinjam',
            loanDate: new Date().getTime(),
            limitDate:addDays(new Date(),Member.posisition),
            MemberId:idMember,
        })
        ListOfBooks.update({status:'dipinjam'},{where:{tag:tag}});
        Member.update({loanAmount:Member.loanAmount+1},{where:{id:idMember}});

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'anggiatpangaribuan12@gmail.com',
                pass: 'sitoluama2'
            }
        });
        
        
        var mailOptions = {
            from: 'anggiatpangaribuan12@gmail.com',
            to: Member.email,
            subject: 'Peminjaman',
            text: 'Peminjaman Buku',
            html :`Hai ${name}, anda baru saja melakukan peminjaman buku ${title} di perpustakaan
            batas pengembalian hingga ${addDays(new Date,Member.posisition)}`
        };
        
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) throw err;
            console.log('Email sent: ' + info.response);
        });
         res.json('SUCCESS')
    }
})

router.get('/Member',async(req,res)=>{
      const {tag} = req.query
      try {
          let i = 0;
          const member = await Members.findOne({where:{tag:tag}});
          const idMember = member.id
          const Peminjaman = await Loans.findAll(
            {where:{MemberId:idMember},
            
             include : [
                 {model:ListOfBooks,require:true,
                    include:[{model:Books,require:true}
                    ]}
            ]});
           res.json(Peminjaman)
     } catch (error) {
         res.json(error.messages)
     }
})

router.get('/All',async (req,res)=>{
      try {
          let i = 0;
         const Peminjaman = await Loans.findAll({
             include : [
                 {model:ListOfBooks,require:true,
                    include:[{model:Books,require:true}
                    ]}  ,{model:Members,require:true}
                ]}
                );
         res.json(Peminjaman)
         
     } catch (error) {
         res.json(error.messages)
     }
})
router.get('/Late',async (req,res)=>{
      try {
        const Peminjaman = await Loans.findAll({
            where : {status:'late'},
            include : [
                {model:ListOfBooks,require:true,
                   include:[{model:Books,require:true}
                   ]}  ,{model:Members,require:true}
               ]}
               );
           res.json(Peminjaman)
     } catch (error) {
         res.json(error.message)
     }
})
router.get('/History',async (req,res)=>{
    const {tag} = req.query
    var i = 0;
      try {
        const Peminjaman = await Loans.findAll({
            include : [
                {model:ListOfBooks,require:true,
                   include:[{model:Books,require:true},
                    {model:Returns,require:true}
                   ]}  ,{model:Members,require:true,
                        where:{tag:tag}}
               ]}
               );
           res.json(Peminjaman)
     } catch (error) {
         res.json(error.message)
     }
})
module.exports = router