var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
//var db = require('monk')('localhost/nodeblog');
var db = require('monk')('mongodb://root:cplusNANO@1@ds115472.mlab.com:15472/nodeblog');

/* GET home page. */
router.get('/', function(req, res, next) {
	var db = req.db;
	var posts = db.get('posts');
	posts.find({}, {}, function(err, posts){
		res.render('index', { posts: posts });
	})
});

module.exports = router;
