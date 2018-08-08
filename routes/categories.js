var express = require('express');
var router = express.Router();

// Make databade accessiable
var mongo = require('mongodb');
//var db = require('monk')('localhost/nodeblog');
var db = require('monk')('mongodb://root:cplusNANO@1@ds115472.mlab.com:15472/nodeblog');

router.get('/show/:category', function(req, res, next) {
    var posts = db.get('posts');

  posts.find({category: req.params.category}, {}, function(err, posts){
     res.render('index' ,{
        'title': req.params.category,
        'posts': posts
    });
  });
});

router.get('/show_author/:author', function(req, res, next) {
    var posts = db.get('posts');

  posts.find({author: req.params.author}, {}, function(err, posts){
     res.render('index' ,{
        'title': req.params.author,
        'posts': posts
    });
  });
});


router.get('/add', function(req, res, next) {
		 res.render('addcategories' ,{
  			'title': 'Add Category'
 		});
});

router.post('/add', function(req, res, next) {
  // Get the forms value
  var name = req.body.name;
  

  // Form validation
  req.checkBody('name','Name field is required').notEmpty();

  // Check Errors
  var errors = req.validationErrors();

  if (errors) {
  	res.render('addpost', {
  		"errors": errors
  	});
  } else {
  	var categories = db.get('categories');
  	categories.insert({
  		"name" : name
  	}, function(err, category){
  		if (err) {
  			res.send(err);
  		}else {
  			req.flash('success', 'Category Added');
  			res.location('/');
  			res.redirect('/');
  		}
  	})
  }
});


module.exports = router;
