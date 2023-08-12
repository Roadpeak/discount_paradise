// jshint esversion:9
const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const cron = require('node-cron');
const app = express();

//middelwares
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(express.static("public/"));

app.use(session({
    secret: 'this is our litle secret',
    resave: true,
    saveUninitialized: false
})
);
app.use(flash());

// routes
app.get('/',(req,res,next)=>{
    res.status(200).json({
        message: "hey"
    })
})
//route_error

//404 route handler
app.get('*', function (req, res) {
    res.redirect('/');
});
app.post('*', function (req, res) {
    res.redirect('/');
});

const port = process.env.PORT || 4000;

const mongoUrl = 'mongodb+srv://admin:<CdmoqLVG8KAgIGPX>@cluster0.g7p2waa.mongodb.net/';
const dbConn = async () => {
    try {
        mongoose.set("strictQuery", false);
        await mongoose.connect(mongoUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        app.listen(port, () => {
            console.log(`server live at port ${port}`);
        });
        console.log('db active');
    } catch (error) {
        console.error(error);
    }
};
dbConn();