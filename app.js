const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const UserModel= require('./model');
const { check, validationResult } = require('express-validator');

const DBURL = process.env.mongodbURL || 'mongodb://127.0.0.1:27017/MerkleUsers';

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.urlencoded({ extended: true }));

// validation checks
const profileValidate = [
    check('firstname')
        .exists()
        .withMessage('firstname is Required')
        .isAlpha("en-US", { ignore: " " })
        .withMessage('firstname wrong format')
        .trim()
        .escape(),
    check('lastname')
        .exists()
        .withMessage('lastname is Required')
        .isAlpha("en-US", { ignore: " " })
        .withMessage('lastname wrong format')
        .trim()
        .escape(),
    check('address1')
        .exists()
        .withMessage('address1 is Required')
        .isAlphanumeric("en-US", { ignore: " " })
        .withMessage('address1 wrong format')
        .trim()
        .escape(),
    check('address2')
        .optional({ nullable: true, checkFalsy: true})
        .isAlphanumeric("en-US", { ignore: " " })
        .withMessage('address2 wrong format')
        .trim()
        .escape(),
    check('city')
        .exists()
        .withMessage('city is Required')
        .isAlpha("en-US", { ignore: " " })
        .withMessage('city wrong format')
        .trim()
        .escape(),
    check('state')
        .exists()
        .withMessage('state is Required')
        .isAlpha("en-US", { ignore: " " })
        .withMessage('state wrong format')
        .trim()
        .escape(),
    check('zip')
        .exists()
        .withMessage('zip is Required')
        .isPostalCode('US')
        .withMessage('zip is not valid')
        .trim()
        .escape(),
    check('country')
        .exists()
        .withMessage('country is Required')
        .isAlpha()
        .withMessage('country not in text form')
        .isLength({ min: 2, max: 2 })
        .withMessage('country is incorrect format, use only 2 letters')
        .isLocale()
        .withMessage('country not a valid locale')
        .trim()
        .escape(),
    check('date')
        .exists()
        .withMessage('date is Required')
        .isISO8601()
        .withMessage('date is not valid, format is YYYY-MM-DD')
        .trim()
        .escape()
];

//Database connection
mongoose.connect(DBURL, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', () => {
    console.error("DB connection failed.");
});
db.once('open', () => {
    console.log("DB connection established.");
});

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

app.post('/confirm', profileValidate, (req, res) => {
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // return res.status(422).json({ errors: errors.array() });
        res.render('error');
    }
    else {
        UserModel.count({ firstname:req.body.firstname, lastname: req.body.lastname }, (err, count) => {
            if(err) console.error(err);
            if(count > 0) {
                res.render('confirm', { data: "User already exists" });
            } else {
                const newUser = new UserModel(req.body);
                console.log(req.body);
                newUser.save((err, user) => {
                    if(err) return console.error(err);
                    res.render('confirm', { data: "" + user.firstname + " " + user.lastname + " has been registered." });
                });
            }
        });
    }
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