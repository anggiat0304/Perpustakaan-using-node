const express = require('express')
const app = express();
const router = express.Router()
const {Administrators,Members} = require('../models');
var nodemailer = require('nodemailer');
const bcrypt = require("bcrypt");

var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); 

const {sign} = require('jsonwebtoken');



router.post("/",async(req,res)=>{
    const {name , nim, email , tag}=req.body

    const adminEmail = await Administrators.findOne({where :{email:email}});
    const memberEmail = await Members.findOne({where :{email:email}});
    const adminTag = await Administrators.findOne({where :{tag:tag}});
    const memberTag = await Members.findOne({where :{tag:tag}});
       if (adminEmail || memberEmail) {
               res.json("Email");
           }else if(adminTag || memberTag){
            res.json("Tag");
           }
           else{
            
                   bcrypt.hash(tag,10).then((hash)=>{
                    Administrators.create({
                           name : name,
                           nik: nim,
                           tag: tag,
                           email: email,
                           status:'Pending',
    
                       })
                       var transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: 'anggiatpangaribuan12@gmail.com',
                            pass: 'sitoluama2'
                        }
                    });
                    
                    
                    link=`http://192.168.137.1:3001/Admin/${email}`;
                    var mailOptions = {
                        from: 'anggiatpangaribuan12@gmail.com',
                        to: email,
                        subject: 'Pendaftaran akun admin di perpustakaan',
                        text: 'Silahkan konfirmasi akun anda',
                        html :`Hai ${name}, silahkan konfirmasi akun anda dengan mengklik link
                                konfirmasi dibawah <br>
                                <p><a href=${link}>Konfirmasi</a></p>`
                    };
                    
                    transporter.sendMail(mailOptions, (err, info) => {
                        if (err) throw err;
                        console.log('Email sent: ' + info.response);
                    });
                });
                
                res.json("SUCCESS");
          
           }

})
router.get('/Login',async (req,res)=>{
    const {tag} = req.query;
  
    const admin = await Administrators.findOne({where :{tag:tag}});

    if  (!admin) {
        res.json('null')
    }
    else if (admin.status =='Pending') {
        res.json('Pending');
    }else if(admin.status == 'Active'){
        const accessToken = sign(
            {tag:admin.username, id:admin.id},
            "importantsecret"
        )
        res.json(accessToken);
    }
})
router.get('/Dashboard',async (req,res)=>{
    const {tag} = req.query;
  
    const admin = await Administrators.findOne({where :{tag:tag}});
    if (!admin) res.json('null')
    res.json(admin)
})
router.get('/:email',async (req,res)=>{
    const email = req.params.email
    const admin = await Administrators.findOne({where:{email:email}});
    if(admin){
        Administrators.update(
            {status:'Active'},{where :{id: admin.id}}
            )
            res.json('aktif');

    }
})

router.get('/Account/EditEmail/:email',async (req,res)=>{
    const {email2} = req.query
    const email = req.params.email
    try {
        const admin = await Administrators.findOne({where:{email:email2}});
        const member = await  Members.findOne({where:{email:email2}});
      if (!admin  && !member ) {
        Administrators.update({email:email2},{where:{email:email}});
        res.json('ok');
      }else{
        res.json('Email Sudah Digunakan')
      }
       
    } catch (error) {
        res.json(error.message)
    }
})
router.get('/Account/EditTag/:email',async (req,res)=>{
    const {tag} = req.query
    const email = req.params.email
    try {
      const admin = await  Administrators.findOne({where:{tag:tag}});
      const member = await  Members.findOne({where:{tag:tag}});
      if (!admin  && !member ) {
        Administrators.update({tag:tag},{where:{email:email}});
        res.json('ok');
      }else{
        res.json('Tag Sudah Digunakan')
      }
    } catch (error) {
        res.json(error.message)
    }
})

router.get('/Account/CheckAccount',async (req,res)=>{
    const {email} = req.query
    const admin = await Administrators.findOne({where:{email:email}});
    res.json(admin);
})
router.get('/Account/DetailAccount/:tag',async (req,res)=>{
   
    const tag = req.params.tag
    const admin = await Administrators.findOne({where:{email:email}});
    res.json(admin);
})
router.post('/Account/ForgotAccount',async (req,res)=>{
    const {email} = req.body
    const adminEmail = await Administrators.findOne({where :{email:email}});
    if(adminEmail){
       res.json('Any');
    }else{
        res.json('Not Any')
    }
})

module.exports = router     