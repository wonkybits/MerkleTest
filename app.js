const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const UserModel= require('./model');

const DBURL = 'mongodb+srv://pstene:AlphaBeta1234@cluster0.o9lly.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
// const DBURL = 'mongodb://127.0.0.1:27017/MerkleUsers';

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(DBURL, { useUnifiedTopology: true, useNewUrlParser: true });

const db = mongoose.connection;
db.on('error', () => {
    console.error("DB connection failed.");
});
db.once('open', () => {
    console.log("DB connection established.");
});

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/confirm', (req, res) => {
    UserModel.count({ firstname:req.body.firstname, lastname: req.body.lastname }, (err, count) => {
        if(err) console.error(err);
        if(count > 0) {
            res.render('confirm', { data: "User already exists" });
        } else {
            req.body.date = Date.now();
            const newUser = new UserModel(req.body);
            newUser.save((err, user) => {
                if(err) return console.error(err);
                res.render('confirm', { data: "" + user.firstname + " " + user.lastname + " has been registered." });
            });
        }
    });
});

app.get('/admin', (req, res) => {
    UserModel.find({}).sort({date: 'desc'}).exec((err, records) => {
        if(err) console.error(err);
        let output = records.reduce((acc, curr) => {
            return acc + "<tr>\n" +
                "<td>" + curr.firstname + "</td>\n" +
                "<td>" + curr.lastname + "</td>\n" +
                "<td>" + curr.address1 + "</td>\n" +
                "<td>" + curr.address2 + "</td>\n" +
                "<td>" + curr.city + "</td>\n" +
                "<td>" + curr.state + "</td>\n" +
                "<td>" + curr.zip + "</td>\n" +
                "<td>" + curr.country + "</td>\n" +
                "<td>" + curr.date + "</td>\n" +
                "</tr>";
        }, '');
        res.render('admin', { data: output });
    });
});

app.get('*', (req, res) => {
    res.render('error');
});

app.listen(port, () => {
    console.log(`listening on port ${port}`)
});