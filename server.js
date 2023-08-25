const express = require('express');
const app = express();
const bodyparser = require('body-parser')
const methodOverride = require('method-override')
app.use(express.urlencoded({extended: true}));
app.set('view engine', 'ejs');
require('dotenv').config();
const path = require('path');

const MongoClient = require('mongodb').MongoClient;

app.use('/public', express.static('public'));
app.use(methodOverride('_method'))

var db;
MongoClient.connect(process.env.mongoURL, function(error, client){
    
    if(error) return console.log(error);
    db = client.db('todoapp');

    app.listen(process.env.PORT, function(){
      console.log('listening on 8080')
    });

    app.get('/', function(req, res){
      if (req.user)
        res.render('index.ejs');
      else
        res.render('login.ejs');
    });

    app.get('/home', function(req, res){
      res.render('index');
  });
    
    app.get('/write', checkLogin, function(req, res){
        res.render('write.ejs');
    });
    
    app.post('/add', function(req, res){
        db.collection('counter').findOne({name : '게시물갯수'}, function(error, result){
            var postNum = result.totalPost;
            db.collection('post').insertOne({_id : postNum + 1, 제목 : req.body.title, 날짜 : req.body.date}, function(error, result){
            console.log('저장완료');
            db.collection('counter').updateOne({name:'게시물갯수'}, { $inc : {totalPost:1}}, function(error, result){
                if (error)
                    return console.log(error);
            })
        });
        req.body.title = "";
        req.body.data = "";
        res.redirect('/write');
    });
    });

    app.get('/list', checkLogin, function(req, res){
        db.collection('post').find().toArray(function(error, result){
            res.render('list.ejs', {posts : result});
        });
    }); 

    app.get('/search', function(req, res){
      db.collection('post').find({$text: {$search : req.query.value} }).toArray(function(error, result){
          console.log(result);
          res.render('search.ejs', {posts : result});
      });

  }); 

    app.delete('/delete', function(req, res){
        console.log(req.body);console.log("이게 바디\n")
        req.body._id =  parseInt(req.body._id);
        db.collection('post').deleteOne(req.body, function(error, result){
            console.log('삭 완');
            res.status(200).send({message : 'success'});
            db.collection('counter').updateOne({name:'게시물갯수'}, { $inc : {totalPost: -1}}, function(error, result){
                if (error)
                    return console.log(error);
        })
    })
    })

    app.get('/detail/:id', function(req, res){
        db.collection('post').findOne({_id : parseInt(req.params.id)}, function(error, result){
            console.log(result);
            if (result == null)
                res.render('detail.ejs', {data : {제목 : '존재 X', 날짜 : '존재 X'}});
            else
                res.render('detail.ejs', {data : result})
        })
    })

    app.get('/edit/:id', function(req, res){
        db.collection('post').findOne({_id : parseInt(req.params.id)}, function(error, result){
            res.render('edit.ejs', {post : result});
        })
    })

        app.put('/edit', function(req, res){
        req.body.id =  parseInt(req.body.id);
        db.collection('post').updateOne({_id : req.body.id}, {$set : {제목 : req.body.title, 날짜 : req.body.date}}, function(error, result){
            console.log("수정 완");
            res.redirect('list');
        })
    })

    // app.put('/edit', function(req, res){
    //     id =  parseInt(req.body._id);
    //     console.log(req.body.title);
    //     db.collection('post').updateOne({_id : id}, {$set : {제목 : req.body.title, 날짜 : req.body.date}}, function(error, result){
    //         if (error)
    //             console.log(error);
    //         console.log('수정 완');
    //         res.status(200).send({message : '/list'});
    //     })
    // })

  })


  const passport = require('passport');
  const LocalStrategy = require('passport-local');
  const session = require('express-session');

  app.use(session({secret : '비밀코드', resave : true, saveUninitialized: false}));
  app.use(passport.initialize());
  app.use(passport.session()); 

  app.get('/login', function(req, res){
    res.render('login.ejs')
  })

  app.post('/login', passport.authenticate('local', {
    failureRedirect : '/fail'
  }),function(req, res){
    res.redirect('/home');
  });

  app.get('/mypage', checkLogin, function(req, res){
    res.render('mypage.ejs', {사용자 : req.user});
  })

  function checkLogin(req, res, next){
    if (req.user){
        next();
    }else {
      res.render('loginprompt.ejs')
    }
    
  }

  passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'pw', 
    session: true,
    passReqToCallback: false,
  }, function (입력한아이디, 입력한비번, done) {
    console.log(입력한아이디, 입력한비번);
    db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
      if (에러) return done(에러) 

      if (!결과) return done(null, false, { message: '존재하지않는 아이디요' })
      if (입력한비번 == 결과.pw) {
        return done(null, 결과)
      } else {
        return done(null, false, { message: '비번틀렸어요' })
      }
    })
  }));

  passport.serializeUser(function (user, done) {
    done(null, user.id)
  });
  
  passport.deserializeUser(function (아이디, done) {
    db.collection('login').findOne({id : 아이디}, function(error, result){
      done(null, result);
    })
  }); 