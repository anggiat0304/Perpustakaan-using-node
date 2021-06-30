const express = require('express')
const app = express();
const cors = require('cors')
var bodyParser = require('body-parser')

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())
const db = require('./models');

//Routers
const AdminRouters = require('./Routes/Admin');
const BookRouters = require('./Routes/Book');
const ListOfBooksRouters = require('./Routes/ListOfBooks');
const MembersRouters = require('./Routes/Member');
const LoansRouters = require('./Routes/Loans');
const ReturnsRouters = require('./Routes/Returns');
const ExtentionsRouters = require('./Routes/Extentions');
const DropboxRouters = require('./Routes/Dropboxs');


app.use("/Admin",AdminRouters);
app.use("/Book",BookRouters);
app.use("/listOfBooks",ListOfBooksRouters);
app.use("/Member",MembersRouters);
app.use("/Loans",LoansRouters);
app.use("/Returns",ReturnsRouters);
app.use("/Extentions",ExtentionsRouters);
app.use("/Dropbox",DropboxRouters);



db.sequelize.sync().then(()=>{
    app.listen(3001,()=>{
        console.log("Server running on port 3001");
    });
});