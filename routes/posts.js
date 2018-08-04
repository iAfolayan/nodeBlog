var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload =  multer({ dest: './public/images/'})

// Make databade accessiable
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');

router.get('/show/:id', function(req, res, next) {
  var posts = db.get('posts');

  posts.findById(req.params.id, function(err, post){
     res.render('show' ,{
        'title': 'Add Post',
        'post': post
    });
  });

});

router.get('/add', function(req, res, next) {
	var categories = db.get('categories');

	categories.find({}, {}, function(err, categories){
		 res.render('addpost' ,{
  			'title': 'Add Post',
  			'categories': categories
 		});
	});

});

router.post('/add', upload.single('mainImage'), function(req, res, next) {
  // Get the forms value
  var title = req.body.title;
  var category = req.body.category;
  var body = req.body.body;
  var author = req.body.author;
  var date = new Date();

  // Check if the image is uploaded
  if (req.file) {
  	var mainImage = req.file.filename
  }else {
  	var mainImage = 'noimage.jpeg';
  }

  // Form validation
  req.checkBody('title','Title field is required').notEmpty();
  req.checkBody('body', 'Body field is required').notEmpty();

  // Check Errors
  var errors = req.validationErrors();

  if (errors) {
  	res.render('addpost', {
  		"errors": errors
  	});
  } else {
  	var posts = db.get('posts');
  	posts.insert({
  		"title" : title,
  		"category" : category,
  		"body" : body,
  		"date" : date,
  		"author" : author,
  		"mainImage" : mainImage
  	}, function(err, post){
  		if (err) {
  			res.send(err);
  		}else {
  			req.flash('success', 'Post Added');
  			res.location('/');
  			res.redirect('/');
  		}
  	})
  }
});



router.post('/addcomment', function(req, res, next) {
  // Get the forms value
  var name = req.body.name;
  var email = req.body.email;
  var postid = req.body.postid;
  var message = req.body.message;
  var date = new Date();


  // Form validation
  req.checkBody('name','Name field is required').notEmpty();
  req.checkBody('email', 'Email is is required but never displayed').notEmpty();
  req.checkBody('email', 'Email is not rightly formatted').isEmail();
  req.checkBody('message', 'Message field is required').notEmpty();

  // Check Errors
  var errors = req.validationErrors();

  if (errors) {
     var posts = db.get('posts');
     posts.findById(postid, function(err, post){
      res.render('show', {
      "errors": errors,
      "post": post
    });
     })
  } else {
    var comment = {
      "name": name,
      "email": email,
      "message": message,
      "date": date 
    }

    var posts = db.get('posts');

    posts.update({
      "_id": postid
    },{
      $push:{
        "comments": comment
      }
    }, function(err, doc){
        if (err) {
          throw err;
        } else {
          req.flash('success', 'Comment Added');
          res.location('/posts/show/' +postid);
          res.redirect('/posts/show/' +postid);
        }
    });
  }
});

module.exports = router;