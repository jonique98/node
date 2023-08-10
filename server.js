const express = require('express');
const app = express();
const mongoURL = 'mongodb+srv://sumin9899:su1214@cluster0.1nanggh.mongodb.net/?retryWrites=true&w=majority'

const MongoClient = require('mongodb').MongoClient;


var db;
MongoClient.connect(mongoURL, function(error, client){
    
    // if(error) return console.log(error);
    db = client.db('todoapp');

    // db.collection('post').insertOne({이름 : 'John', 나이 :20, _id : 100}, function(error, result){
    //     console.log('저장완료');
    // });

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
        db.collection('post').insertOne({제목 : req.body.title, 날짜 : req.body.date, _id : 100}, function(error, result){
        console.log('저장완료');
    });
    });

  })
