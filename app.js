var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const chalk = require('chalk');
require('dotenv').config();
const mongodb = require('mongodb');
const cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var questionsRouter = require('./routes/questions');
var answersRouter = require('./routes/answers');
var testRouter = require('./routes/test');

var app = express();
app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/questions', questionsRouter);
app.use('/answers', answersRouter);
app.use('/test', testRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

let MongoClient = mongodb.MongoClient;
console.log(chalk.rgb(255, 255, 255).bgMagenta.underline(`Conectando a  -> ${process.env.MONGODB_LOCATION}`));
MongoClient.connect(
  process.env.MONGODB_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  },
  (err, client) => {
    if (err !== null) {
      console.log(err);
    } else {
      app.locals.db = client.db("accexible");
      console.log(chalk.black.bgGreenBright.underline(`Conectado!`));
    }
  });

module.exports = app;
