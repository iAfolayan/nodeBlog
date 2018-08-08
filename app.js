var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var multer = require('multer');
var upload =  multer({ dest: './public/images'})
var expressValidator = require('express-validator');

var mongo = require('mongodb');
//var db = require('monk')('localhost/nodeblog');
var db = require('monk')('mongodb://root:cplusNANO@1@ds115472.mlab.com:15472/nodeblog');

var indexRouter = require('./routes/index');
var postsRouter = require('./routes/posts');
var categoriesRouter = require('./routes/categories');

var app = express();

app.locals.moment = require('moment');

//Truncate text
app.locals.truncateText = function(text, length){
	var truncatedText =text.substring(0, length);
	return truncatedText;
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Express Session
app.use(session({
	secret: 'secret',
	saveUninitialized: true,
	resave: true
}));

// Express validator
app.use(expressValidator({
	errorFormatter: function(param, msg, value){
		var namespace = param.split('.')
		, root = namespace.shift()
		, formParam = root;

	while(namespace.length) {
		formParam += '[' + namespace.shift() + ']';
	}
	return{
		param : formParam,
		msg   : msg,
		value : value
	};
	}
}));

// connect flash
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Make our db accessable to our router 
app.use(function(req,res,next){
	req.db = db;
	next();
});

app.use('/', indexRouter);
app.use('/posts', postsRouter);
app.use('/categories', categoriesRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
