const express = require('express');
const app = express();
const bodyparser = require('body-parser')
const methodOverride = require('method-override')
app.use(express.urlencoded({extended: true}));
const mongoURL = 'mongodb+srv://sumin9899:su1214@cluster0.1nanggh.mongodb.net/?retryWrites=true&w=majority'
app.set('view engine', 'ejs');

const MongoClient = require('mongodb').MongoClient;

app.use('/public', express.static('public'));
app.use(methodOverride('_method'))

var db;
MongoClient.connect(mongoURL, function(error, client){
    
    if(error) return console.log(error);
    db = client.db('todoapp');

    app.listen('8080', function(){
      console.log('listening on 8080')
    });

    app.get('/', function(req, res){
        res.render('index.ejs');
    });
    
    app.get('/write', function(req, res){
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

         
    });
    });

    app.get('/list', function(req, res){
        db.collection('post').find().toArray(function(error, result){
            console.log(result);
            res.render('list.ejs', {posts : result});
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
