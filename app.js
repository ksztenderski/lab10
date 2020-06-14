var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var SQLiteStore = require('connect-sqlite3')(session);
var sqlite3 = require('sqlite3').verbose();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
app.use(cookieParser());

var db = new sqlite3.Database(':memory:')
db.serialize(function () {
    db.run("CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, username varchar)");
    db.run("INSERT INTO users (username) VALUES ('user_1')");
    db.run("INSERT INTO users (username) VALUES ('user_2')");
    db.run("CREATE TABLE memes (id INTEGER PRIMARY KEY AUTOINCREMENT, name varchar, price INTEGER, url varchar)");
    db.run("INSERT INTO memes (name, price, url) VALUES ('Gold', 1000, 'https://i.redd.it/h7rplf9jt8y21.png')");
    db.run("INSERT INTO memes (name, price, url) VALUES ('Platinum', 1100, 'http://www.quickmeme.com/img/90/90d3d6f6d527a64001b79f4e13bc61912842d4a5876d17c1f011ee519d69b469.jpg')");
    db.run("INSERT INTO memes (name, price, url) VALUES ('Elite', 1200, 'https://i.imgflip.com/30zz5g.jpg')");
    db.run("INSERT INTO memes (name, price, url) VALUES ('Why', 1300, 'https://i.kym-cdn.com/photos/images/original/001/492/343/782.png')");
    db.run("INSERT INTO memes (name, price, url) VALUES ('Avocado', 1400, 'https://www.fosi.org/media/images/funny-game-of-thrones-memes-coverimage.width-800.jpg')");
    db.run("INSERT INTO memes (name, price, url) VALUES ('Rewatch', 1500, 'https://img-9gag-fun.9cache.com/photo/aD4wV2w_700bwp.webp')");
    db.run("CREATE TABLE history (meme_id INTEGER, user_id INTEGER, price INTEGER, date DATE)");
})

class Meme {
    constructor(id, name, prices, url) {
        this.id = id;
        this.name = name;
        this.prices = prices;
        this.url = url;
    }

    change_price(newPrice) {
        this.prices.push(newPrice);
    }
}

let headerMeme = {
    'name': 'Study',
    'url': 'https://img-9gag-fun.9cache.com/photo/aGdwvYw_700bwp.webp'
}

app.set('headerMeme', headerMeme);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    resave: true,
    saveUninitialized: false,
    store: new SQLiteStore,
    secret: 'aWWTPfTVKg5TDOWwyTOIBlTu0BxBKoprjYpfohAbvWJlHBuUwR',
    cookie: {maxAge: 15 * 60 * 1000}
}));
app.use(function (req, res, next) {
    req.db = db;
    next();
});
app.use('/', indexRouter);
app.use('/login', indexRouter);
app.use('/meme/:memeId', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
