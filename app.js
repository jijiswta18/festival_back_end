
const express       = require('express');
const db            = require('./config/db');
const bodyParser    = require('body-parser');
const moment        = require('moment');
const cors          = require('cors');
const bcrypt        = require('bcrypt');
const jwt           = require('jsonwebtoken');
const auth          = require('./middleware/auth');
const fs            = require('fs');
const multer        = require('multer');

// var ldap            = require('ldapjs');
// var server          = ldap.createServer();

const app           = express()

require("dotenv").config();

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



app.use(cors({
        //"Access-Control-Allow-Origin": "https://forqueen.cgd.go.th",
    origin: '*'

}));

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads');
    },

    filename: function (req, file, cb) {
        console.log(req.body);
        let newFileName         =   req.body.image_name
       cb(null, newFileName);
    }
 });

var upload = multer({ storage: storage });

moment.locale('th');
let date = moment().format('YYYY-MM-DD HH:mm:ss');


app.get('/api/',(req,res)=>{
    res.send('Hello World!');
});

app.post('/api/login',  async (req, res) => {

    try {
  
        const { username, password } = req.body;
    
        if (!(username && password)) {
            res.status(400).send("All input is required")
        }
  
        const sql = 'SELECT * FROM user_festival WHERE username = ?'; 
  
        db.query(sql, [username], async function (err, result, fields) {
    
            if (err) throw err;
    
            if(result.length > 0){
                user = result[0]
            }else{
                res.status(400).send("Invalid Credentials");
            }

            if(user && (await bcrypt.compare(password, user.password))){
           
                const newToken = jwt.sign(
                    { username : user.username },
                    process.env.JWT_KEY,
                    {
                        expiresIn: "2h"
                    }
                )
    
                const sql = 'UPDATE user_festival SET token = ? WHERE username = ?'; 
    
                db.query(sql, [newToken, username], function (err, result2, fields) {
        
                    if (err) throw err;
                    return res.json({userdata: user, token:newToken})
                
                });
    
            }
        });
  
    } catch (error) {
      console.log(error); 
    }  
});

app.post('/api/uploadFile', upload.single('image'), async (req, res) => {

    const obj = JSON.parse(JSON.stringify(req.body));

    const image = req.image

    res.send(apiResponse({message: 'File uploaded successfully.', image}));

});

app.post('/api/uploadFileBg', upload.single('image'), async (req, res) => {

    const obj = JSON.parse(JSON.stringify(req.body));

    const image = req.image

    res.send(apiResponse({message: 'File uploaded successfully.', image}));

});

app.post('/api/uploadFileBtn', upload.single('image'), async (req, res) => {

    const obj = JSON.parse(JSON.stringify(req.body));

    const image = req.image

    res.send(apiResponse({message: 'File uploaded successfully.', image}));

});
  

// list festival //
app.post('/api/createFestival', async (req,res)=> {  

    let data = {
        "name"          : req.body.name,
        "color"         : req.body.color,
        "start_date"    : req.body.start_date,
        "end_date"      : req.body.end_date,
        "status"        : req.body.status,
        "state"         : 1,
        "create_by"     : req.body.user_id,
        "create_date"   : date,
        "modified_by"   : req.body.user_id,
        "modified_date" : date
    }

    let arr_file_img    = req.body.file_name.split(".")

    let arr_file_bg     = req.body.file_bg_name.split(".")

    let arr_file_btn     = req.body.file_btn_name.split(".")

    let sql = "INSERT INTO list_festival SET ?"

    db.query(sql,data,(error,results,fields)=>{

        console.log(error);
        if (error) return res.status(500).json({
            "status": 500,
            "message": "Internal Server Error" // error.sqlMessage
        })

        data = [{'id':results.insertId, ...data}]

        // insert ชื่อไฟล์
        let filenameImg = 'imgfid_' + results.insertId + '.' +arr_file_img[1] 

        let filenameBg = 'bgfid_' + results.insertId + '.' +arr_file_bg[1] 

        let filenameBtn = 'btnfid_' + results.insertId + '.' +arr_file_btn[1] 
  
        let data_img = {
            "file_name"     : filenameImg,
            "file_bg_name"  : filenameBg,
            "file_btn_name" : filenameBtn,
        }
        
        sql = "UPDATE list_festival SET ? WHERE id = " +results.insertId

        db.query(sql, data_img, (error,results,fields) => {

        })

        // update สถานะการใช้งาน
        if(req.body.status == 1){
            
            sql = "UPDATE list_festival SET status = 0  WHERE id != "+results.insertId

            db.query(sql, (error,results,fields) => {
                
            })

        }

        const result = {
            "status"    :  200,
            "row_id"    :  results.insertId,
            "file_img"  :  data_img.file_name,
            "file_bg"  :   data_img.file_bg_name,
            "file_btn"  :  data_img.file_btn_name,
        }

        return res.json(result)

    })
});

app.post('/api/updateFestival', async (req,res)=> { 

    let item = {
        "name"          : req.body.name,
        "file_name"     : req.body.file_name,
        "file_bg_name"  : req.body.file_bg_name,
        "file_btn_name" : req.body.file_btn_name,
        "color"         : req.body.color,
        "start_date"    : req.body.start_date,
        "end_date"      : req.body.end_date,
        "status"         : req.body.status,
        "modified_by"   : req.body.user_id,
        "modified_date" : date
    }

    let sql = "UPDATE list_festival SET ? WHERE id = ?"
    
    db.query(sql, [item, req.body.fid], (error,results,fields)=>{

        if (error) return res.status(500).json({
            "status": 500,
            "message": "Internal Server Error" // error.sqlMessage
        })

        if(req.body.status == 1){
            
            sql = "UPDATE list_festival SET status = 0  WHERE id != "+req.body.fid

            db.query(sql, (error,results,fields) => {
                
            })

        }
        
        const result = {
            "status": 200,
            "data": results
        }
     
        return res.json(result)
    })

   

});

app.post('/api/updateFestivalStatus', async (req,res)=> { 

    let item = {
        "status"         : req.body.status,
        "modified_by"   : req.body.user_id,
        "modified_date" : date
    }

    let sql = "UPDATE list_festival SET ? WHERE id = ?"
    
    db.query(sql, [item, req.body.fid], (error,results,fields)=>{

        if (error) return res.status(500).json({
            "status": 500,
            "message": "Internal Server Error" // error.sqlMessage
        })


        if(req.body.status == 1){
            
            sql = "UPDATE list_festival SET status = 0  WHERE id != "+req.body.fid

            db.query(sql, (error,results,fields) => {
                
            })

        }

        // user = [{'id':results.insertId, ...user}]
        const result = {
            "status": 200,
            "data": results
        }


     
        return res.json(result)
    })

   

});

app.post('/api/deleteFestival', (req, res)=>{

    let data = {
        "state"     : '-2',
        "modified_by" : req.body.user_id,
        "modified_date" : date
    }

    let sql = "UPDATE list_festival SET ? WHERE id = ?"

    db.query(sql, [data, req.body.id], (error,results,fields)=>{

        if (error) return res.status(500).json({
            "status": 500,
            "message": "Internal Server Error" // error.sqlMessage
        })
        // user = [{'id':results.insertId, ...user}]
        const result = {
            "status": 200,
            "data": results
        }
     
        return res.json(result)
    })
    

});

app.get('/api/getFestival', (req,res)=> { 

    const sql = 'SELECT * FROM list_festival WHERE state = 1 ';

    db.query(sql, function (err, results, fields) {

        if (err) return res.status(500).json({
            "status": 500,
            "message": "Internal Server Error" // error.sqlMessage
        })

        const result = {
            "status": 200,
            "data"  : results, 
        }

          return res.json(result)

      });

});

app.get('/api/checkFestival', (req,res)=> { 

    const sql = 'SELECT id, start_date, end_date FROM list_festival WHERE status = 1 ';

    db.query(sql, function (err, results, fields) {


        console.log(err);

        if (err) return res.status(500).json({
            "status": 500,
            "message": "Internal Server Error" // error.sqlMessage
        })

        const result = {
            "status": 200,
            "data"  : results, 
        }

          return res.json(result)

      });

});

app.get('/api/getFestivalSign', (req,res)=> { 

    const sql = 'SELECT * FROM list_festival WHERE status = 1 ';


    db.query(sql, function (err, results, fields) {

        // console.log(err);

        if (err) return res.status(500).json({
            "status": 500,
            "message": "Internal Server Error" // error.sqlMessage
        })

        const result = {
            "status": 200,
            "data"  : results, 
        }

          return res.json(result)

      });

});

app.get('/api/getFestivalDetail/:id', (req,res)=> { 

    const  id  = req.params.id;

    const sql = 'SELECT * FROM list_festival WHERE id = ?';

    db.query(sql, id, function (err, results, fields) {

          if (err) return res.status(500).json({
              "status": 500,
              "message": "Internal Server Error" // error.sqlMessage
          })

          const result = {
              "status": 200,
              "data": results
          }

          return res.json(result)

      });

});

app.get('/api/getReportFestival', (req,res)=> { 

    // const sql = 'SELECT id, name FROM list_festival WHERE state = 1 ';

    const sql = "SELECT a.id, a.name, COUNT(b.id_festival) totalCount FROM list_festival AS a JOIN sign_festival as b ON a.id = b.id_festival WHERE state = 1 GROUP BY a.id";

    db.query(sql, function (err, results, fields) {

        if (err) return res.status(500).json({
            "status": 500,
            "message": "Internal Server Error" // error.sqlMessage
        })

      

        const result = {
            "status": 200,
            "data"  : results, 
        }

          return res.json(result)

      });

});


// festival
app.post('/api/createFestivalSign', async (req,res)=> {  

    let item = {
        "id_festival"   : req.body.id_festival,
        "name"          : req.body.name,
        "lastname"      : req.body.lastname,
        "regis_date"    : req.body.regis_date,
        "browser"       : req.body.browser,
        "device"        : req.body.device,
        "ip_user"       : req.headers['x-forwarded-for'],
    }

    let sql = "INSERT INTO sign_festival SET ?"

    db.query(sql,item,(error,results,fields)=>{

        if (error) return res.status(500).json({
            "status": 500,
            "message": "Internal Server Error" // error.sqlMessage
        })

        datas = [{'id':results.insertId,...item}]

        sql = "SELECT COUNT(*) as sign_count FROM sign_festival WHERE id_festival = " +req.body.id_festival

        db.query(sql, (err,rows,fields) => {

            if(err) throw err;

            const result = {
                "status"    :  200,
                "data"      : datas,
                "counter"   : rows[0].sign_count
            }

            return res.json(result)
        })

      


    })


});

app.get('/api/export_ffuagvylst/:id', async (req,res)=> { 

    const sql = "SELECT * FROM sign_festival WHERE id_festival = " +req.params.id

    db.query(sql, (error,results,fields)=>{

        
        if (error) return res.status(500).json({
            "status": 500,
            "message": "Internal Server Error" // error.sqlMessage
        })

        const result = {
            "status": 200,
            "data": results
        }
     
        return res.json(result)
    })

});





// user //
app.post('/api/createUser', async (req,res)=> { 

    const hashedPassword = await bcrypt.hash(req.body.password, 10)

    let user = {
        "username"      : req.body.username,
        "password"      : hashedPassword,
        "name"          : req.body.name,
        "lastname"      : req.body.lastname,
        "position"      : req.body.position,
        "divisions"     : req.body.divisions,
        "roles"         : req.body.roles,
        "detail"        : req.body.detail,
        "status"        : req.body.status,
        "state"         : 1,
        "create_by"     : req.body.userId,
        "create_date"   : date,
        "modified_by"   : req.body.userId,
        "modified_date" : date
    }

    const token = jwt.sign(
        { username      : user.username },
        process.env.JWT_KEY,
        {
            expiresIn: "2h"
        }
    );

    user.token = token;

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

});

app.post('/api/updateUser', async (req,res)=> { 

    let user = {
        "name"          : req.body.name,
        "lastname"      : req.body.lastname,
        "position"      : req.body.position,
        "divisions"     : req.body.divisions,
        "roles"         : req.body.roles,
        "detail"        : req.body.detail,
        "status"        : req.body.status,
        "state"         : req.body.state,
        "modified_by"   : req.body.userId,
        "modified_date" : date
    }

    let sql = "UPDATE user_festival SET ? WHERE id = ?"
    db.query(sql, [user, req.body.id], (error,results,fields)=>{

        
        if (error) return res.status(500).json({
            "status": 500,
            "message": "Internal Server Error" // error.sqlMessage
        })

        const result = {
            "status": 200,
            "data": results
        }
     
        return res.json(result)
    })

});

app.post('/api/deleteUser', (req, res)=>{

    let user = {
        "state"         : '-2',
        "status"        :  '0',
        "modified_by"   : req.body.userId,
        "modified_date" : date
    }

    let sql = "UPDATE user_festival SET ? WHERE id = ?"

    db.query(sql, [user, req.body.id], (error,results,fields)=>{

        if (error) return res.status(500).json({
            "status": 500,
            "message": "Internal Server Error" // error.sqlMessage
        })
        // user = [{'id':results.insertId, ...user}]
        const result = {
            "status": 200,
            "data": results
        }
     
        return res.json(result)
    })
    

})

app.get('/api/getUser', (req,res)=> { 

    const sql = 'SELECT id, username, name, lastname, position, divisions, roles, detail, status, state, create_by, create_date, modified_by, modified_date FROM user_festival ';

    db.query(sql, async function (err, results, fields) {

        if (err) return res.status(500).json({
            "status": 500,
            "message": "Internal Server Error" // error.sqlMessage
        })

        const result = {
            "status": 200,
            "data"  : results, 
        }

          return res.json(result)

      });

});


app.get('/api/getUserDetail/:id', (req,res)=> { 

    const  id  = req.params.id;

    const sql = 'SELECT id, username, name, lastname, position, divisions, roles, detail, status, state, create_by, create_date, modified_by, modified_date FROM user_festival WHERE id = ?';

    db.query(sql, id, function (err, results, fields) {

          if (err) return res.status(500).json({
              "status": 500,
              "message": "Internal Server Error" // error.sqlMessage
          })

          const result = {
              "status": 200,
              "data": results
          }

          return res.json(result)

      });

});

app.post('/api/welcome', auth, (req, res) => {
    res.status(200).send('Hello');
})

function apiResponse(results){
    return JSON.stringify({"status": 200, "error": null, "response": results});
}



app.listen(5000,()=>{
    console.log('Server is listening on port 5000...')
})

