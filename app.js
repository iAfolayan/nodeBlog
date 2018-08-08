import cool from 'cool-ascii-faces';
import createError from 'http-errors';
import express, { json, urlencoded, static } from 'express';
import { join } from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import session from 'express-session';
import multer from 'multer';
var upload =  multer({ dest: './public/images'})
import expressValidator from 'express-validator';

import mongo from 'mongodb';
var db = require('monk')('localhost/nodeblog');

import indexRouter from './routes/index';
import postsRouter from './routes/posts';
import categoriesRouter from './routes/categories';

var app = express();

app.locals.moment = require('moment');

//Truncate text
app.locals.truncateText = function(text, length){
	var truncatedText =text.substring(0, length);
	return truncatedText;
}

// view engine setup
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());
app.use(static(join(__dirname, 'public')));
app.use('/cool', (req, res) => res.send(cool()));

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

export default app;
