// var createError = require('http-errors');
// var express = require('express');
// var path = require('path');
// var cookieParser = require('cookie-parser');
// var logger = require('morgan');

// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');

// var app = express();

// // view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

// app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

// module.exports = app;


const express = require('express');
const db = require('./config/db');
const app = express()
var bodyParser = require('body-parser');
var moment = require('moment');
// var tz = require('moment-timezone');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// const router = express.Router()
const cors = require('cors');
app.use(cors({
        //"Access-Control-Allow-Origin": "https://forqueen.cgd.go.th",
    origin: '*'

}));


moment.locale('th');
let date = moment().format('YYYY-MM-DD HH:mm:ss');

app.get('/api/',(req,res)=>{
  console.log('===================');
});

app.post('/api/createUser',(req,res)=> { 
  let user = {
    "username"  : req.body.username,
    "password"  : req.body.password,
    "name"      : req.body.name,
    "lastname"  : req.body.lastname,
    "position"  : req.body.position,
    "divisions" : req.body.divisions,
    "roles"     : req.body.roles,
    "detail"    : req.body.detail,
    "state"     : '1',
    "create_by" : '1',
    "create_date" : date,
    "modified_by" : '1',
    "modified_date" : date
  }   
  let sql = "INSERT INTO user_festival SET ?"
      db.query(sql,user,(error,results,fields)=>{
          if (error) return res.status(500).json({
              "status": 500,
              "message": "Internal Server Error" // error.sqlMessage
          })
          user = [{'id':results.insertId, ...user}]
          const result = {
              "status": 200,
              "data": user.id
          }
          return res.json(result)
      })

  // res.end("================")

});

app.get('/api/listUser',(req,res)=> { 
  let sql = "SELECT * FROM user_festival SET ?"
      db.query(sql,(error,results,fields)=>{
          if (error) return res.status(500).json({
              "status": 500,
              "message": "Internal Server Error" // error.sqlMessage
          })
          // user = [{'id':results.insertId, ...user}]
          const result = {
              "status": 200,
              "data": 'data'
          }
          return res.json(result)
      })

  // res.end("================")

});



app.listen(5000,()=>{
    console.log('Server is listening on port 5000...')
})

