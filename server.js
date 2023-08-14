const express = require('express');
const app = express();
const bodyparser = require('body-parser')
app.use(express.urlencoded({extended: true}));
const mongoURL = 'mongodb+srv://sumin9899:su1214@cluster0.1nanggh.mongodb.net/?retryWrites=true&w=majority'
app.set('view engine', 'ejs');

const MongoClient = require('mongodb').MongoClient;

app.use

var db;
MongoClient.connect(mongoURL, function(error, client){
    
    if(error) return console.log(error);
    db = client.db('todoapp');

    app.listen('8080', function(){
      console.log('listening on 8080')
    });

    app.get('/', function(req, res){
        res.sendFile(__dirname + '/index.html');
    });
    
    app.get('/write', function(req, res){
        res.sendFile(__dirname + '/write.html');
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

         
    });
    });

    app.get('/list', function(req, res){
        db.collection('post').find().toArray(function(error, result){
            console.log(result);
            res.render('list.ejs', {posts : result});
        });

    }); 

    app.delete('/delete', function(req, res){
        console.log(req.body);
        req.body._id =  parseInt(req.body._id);
        db.collection('post').deleteOne(req.body, function(error, result){
            console.log('삭 완'); 
            db.collection('counter').updateOne({name:'게시물갯수'}, { $inc : {totalPost: -1}}, function(error, result){
                if (error)
                    return console.log(error);
        })
    })
    })

  })
