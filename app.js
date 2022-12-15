
const express       = require('express');
const cors          = require('cors');
const auth          = require('./middleware/auth');
const multer        = require('multer');
const moment        = require('moment');
const fetch         = require('node-fetch');
const app           = express();
const db            = require('./config/db');
const bodyParser    = require('body-parser');
const bcrypt        = require('bcrypt');
const jwt           = require('jsonwebtoken');
const ldap          = require('ldapjs');
const fs            = require('fs');
const request       = require('request');
const path          = require('path');
// const Buffer        = require('buffer');
const { Buffer } = require("node:buffer");



// ใช้งาน router module
const userApi       = require('./api/users');
const reportApi     = require('./api/reports');
const festivalApi   = require('./api/festivals');
// const { request }   = require('http');

// เรียกใช้งาน indexRouter
app.use('/api', [festivalApi, userApi, reportApi]);

app.use(express.static('public'));
// app.use("/public", express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({
        //"Access-Control-Allow-Origin": "https://forqueen.cgd.go.th",
    origin: '*'

}));


// Create LDAP client connection 
const adConfiguration = {
    url: "ldap://" + process.env.ad_URL,
    reconnect: true,
  }
const client = ldap.createClient(adConfiguration)
client.on('error', () => {
    // this will be your ECONNRESET message
})

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads');
    },

    filename: function (req, file, cb) {
        let newFileName         =   req.body.image_name
       cb(null, newFileName);
    },
    limits: {
        fileSize: 100000
    },
    onFileSizeLimit: function (file) {
        console.log('Failed: ' + file.originalname + ' is limited')
        fs.unlink(file.path)
    }
});

var upload = multer({ storage: storage });

moment.locale('th');
let date = moment().format('YYYY-MM-DD HH:mm:ss');




app.post('/api/uploadImage',upload.single('images'),(req,res) => {
    res.send(req.files);
})
app.post('/api/uploadBg',upload.single('images'),(req,res) => {
    res.send(req.files);
})
app.post('/api/uploadBtn',upload.single('images'),(req,res) => {
    res.send(req.files);
})

app.get('/api/',(req,res)=>{
    res.send('Hello World!');
});

app.post('/api/login', async (req, res) =>{

    try {   

        const username = req.body.username
        const password = req.body.password
    
        const hashedPassword = await bcrypt.hash(password, 10)
    
        const sql = 'SELECT * FROM user_festival WHERE username = ?'; 
    
        db.query(sql, username, function (err, result, fields) {
    
            let user = null
    
    
            if(result.length > 0){

                user = result[0]

            }else{
                
                res.status(400).send("error : no user in the system");

            }
    
            // console.log('lllllllll',user.username);
    
            if(user && user.status === 1){
    
                const username_ad = 'ad\\'+ user.username

                console.log(username_ad);
                console.log(password);

                client.bind(username_ad, password, err => {

                    
                    if (err) {

                        res.status(400).send("error : password error");
            
                    } else {
                        /*if connection is success then go for any operation*/
                        console.log("Success");
                        // client.destroy();

                        // results = true

                        const newToken = jwt.sign(
                            { username : user.username },
                                process.env.JWT_KEY,
                            {
                                expiresIn: "2h"
                            }
                        )

                        


                                    
                        let updateData = {
                            "token"     : newToken,
                            "password"  : hashedPassword,
                        }


                        const sql = 'UPDATE user_festival SET ? WHERE username = ?'; 
            
                        db.query(sql, [updateData, username], function (err, result2, fields) {
                
                            // console.log(res.json({userdata: user, token:newToken}));

                            return res.json({userdata: user, token:newToken})
                            
                        });
                    }

                })

            }else{
                res.status(400).send("error : no user in the system");
            }

          
    
        });
        
    } catch (error) {
        console.log(error);
    }
   



  
})


// app.post('/api/login',  async (req, res) => {

//     try {
  
//         const { username, password } = req.body;
    
//         if (!(username && password)) {
//             res.status(400).send("All input is required")
//         }
  
//         const sql = 'SELECT * FROM user_festival WHERE username = ?'; 
  
//         db.query(sql, [username], async function (err, result, fields) {
    
//             if (err) throw err;
    
//             if(result.length > 0){
//                 user = result[0]
//             }else{
//                 res.status(400).send("Invalid Credentials");
//             }


//             console.log(user);


//             if(user && (await bcrypt.compare(password, user.password))){
           
//                 const newToken = jwt.sign(
//                     { username : user.username },
//                     process.env.JWT_KEY,
//                     {
//                         expiresIn: "2h"
//                     }
//                 )
    
//                 const sql = 'UPDATE user_festival SET token = ? WHERE username = ?'; 
    
//                 db.query(sql, [newToken, username], function (err, result2, fields) {
        
//                     if (err) throw err;
//                     return res.json({userdata: user, token:newToken})
                
//                 });
    
//             }
//         });
  
//     } catch (error) {
//       console.log(error); 
//     }  
// });

// app.post('/api/uploadImage', upload.single('upload'), (req, res) => {

//     if (!req.file) {
//         console.log("No file upload");
//     } else {
     
//         let img = Buffer.from(JSON.parse(input));

//         var imgsrc = req.file.buffer
//         // var imgsrc =  req.file;
//         // console.log(req.file)
//         // var insertData = "update INTO list_festival"
//         let insertData = "UPDATE list_festival SET image = ? WHERE id = 1"
//         db.query(insertData, [imgsrc], (err, result) => {
    
//             if (err) throw err
//             console.log("file uploaded")
//         })
//     }
//     res.sendStatus(200);
// });

// app.get('/api/getImageFestival', async (req,res)=> { 

//     try {

//         // const url = "http://"+req.get('host')+"/uploads/imgfid_1.png";
//         const url = "http://"+req.get('host')+"/uploads/"+req.query.filename;

//         request({
//             url: url,
//             encoding: null
//         },
//         (err, resp, buffer) => {
//             if(err){

//                 console.log('=>>>>>>>>>>',err);
//             }
//             res.set("Content-Type", "image/jpeg");
//             res.send(resp.body)
//         });
            
//     } catch (error) {

//         console.log(error);
        
//     }

// });

// app.get('/api/getImageFestival', async (req,res)=> { 

//     try {

//         const fullUrl = `${req.protocol}://${req.hostname}:5000`;
//         // console.log(req.headers.host)

//         // const url = "http://"+req.get('host')+"/uploads/imgfid_1.png";
//         const url =  fullUrl+"/uploads/"+req.query.filename;
//         request({
//             url: url,
//             encoding: null
//         }, 
//         (err, resp, buffer) => {
//             console.log('==============')
//             if(err){

//                 console.log('=>>>>>>>>>>',err);
//             }
//             res.set("Content-Type", "image/jpeg");
//             res.send(resp.body)
//         });
            
//     } catch (error) {

//         console.log(error);
        
//     }

// });


app.get('/api/getImageFestival', async (req,res)=> { 

    try {

        const fullUrl           = await `${req.protocol}://${req.hostname}:5000`;
        const url               = await fullUrl+"/uploads/"+req.query.filename;
        const imageUrl          = await url;
        const imageUrlData      = await fetch(imageUrl);
        const buffer            = await imageUrlData.arrayBuffer();
        const stringifiedBuffer = await Buffer.from(buffer).toString('base64');
        const contentType       = await imageUrlData.headers.get('content-type');
        const imageBas64        = await `data:image/${contentType};base64,${stringifiedBuffer}`;

        await res.send(imageBas64)
              
    } catch (error) {

        console.log(error);
        
    }

});
// app.get('/api/getImageFestival', async (req,res)=> { 

//     try {

//         const fullUrl = await `${req.protocol}://${req.hostname}`;

//         const url = await fullUrl+"/uploads/"+req.query.filename;


//         await res.send(url)
              
//     } catch (error) {

//         console.log(error);
        
//     }

// });

app.post('/api/uploadFile', upload.single('images'), async (req, res) => {

    res.send(apiResponse({message: 'File uploaded successfully.'}));

});

app.post('/api/uploadFileBg', upload.single('images'), async (req, res) => {


    res.send(apiResponse({message: 'File uploaded successfully.'}));

});

app.post('/api/uploadFileBtn', upload.single('images'), async (req, res) => {


    res.send(apiResponse({message: 'File uploaded successfully.'}));

});
  

// list festival //
app.post('/api/createFestival', auth, async (req,res)=> {  
    
    try {

        let data = await {
            "name"              : req.body.name,
            "detail"            : req.body.detail,
            "color"             : req.body.color,
            "start_date"        : req.body.start_date,
            "end_date"          : req.body.end_date,
            "status"            : req.body.status,
            "state"             : 1,
            "status_reference"  : req.body.status_reference,
            "create_by"         : req.body.user_id,
            "create_date"       : date,
            "modified_by"       : req.body.user_id,
            "modified_date"     : date
        }

    
        let arr_file_img    = await req.body.file_name.split(".")
    
        let arr_file_bg     = await req.body.file_bg_name.split(".")
    
        let arr_file_btn     = await req.body.file_btn_name.split(".")
    
        let sql = await "INSERT INTO list_festival SET ?"
    
        await db.query(sql,data,(error,results,fields)=>{


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
        
    } catch (error) {
        console.log(error);
    }


});

app.post('/api/updateFestival', auth, async (req,res)=> { 

    try {

        let item = {
            "name"          : req.body.name,
            "detail"        : req.body.detail,
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
        
    } catch (error) {
        console.log(error);
    }

});

app.post('/api/updateFestivalStatus', auth, async (req,res)=> { 

    try {
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
    
    } catch (error) {
        console.log(error);
    }

});

app.post('/api/updateReferenceStatus', auth, async (req,res)=> { 

    try {
        let item = {
            "status_reference"  : req.body.status_reference,
            "modified_by"       : req.body.user_id,
            "modified_date"     : date
        }
    
        let sql = "UPDATE list_festival SET ? WHERE id = ?"
        
        db.query(sql, [item, req.body.fid], (error,results,fields)=>{
    
            if (error) return res.status(500).json({
                "status": 500,
                "message": "Internal Server Error" // error.sqlMessage
            })
    
    
            // if(req.body.status == 1){
                
            //     sql = "UPDATE list_festival SET status = 0  WHERE id != "+req.body.fid
    
            //     db.query(sql, (error,results,fields) => {
                    
            //     })
    
            // }
            // user = [{'id':results.insertId, ...user}]
            const result = {
                "status": 200,
                "data": results
            }
    
            return res.json(result)
        })
    
    } catch (error) {
        console.log(error);
    }

});

app.post('/api/deleteFestival', auth, (req, res)=>{

    try {

        let data = {
            "status"     : req.body.status,
            "state"     : req.body.state,
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
        
    } catch (error) {

        console.log(error);
        
    }

});

app.get('/api/checkFestival', (req,res)=> { 

    try {

        const sql = 'SELECT id, start_date, end_date, name, detail  FROM list_festival WHERE status = 1 ';

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
            
    } catch (error) {

        console.log(error);
        
    }

});



// festival
app.post('/api/createFestivalSign', async (req,res)=> {  

    try {

        let item = {
            "id_festival"       : req.body.id_festival,
            "name"              : req.body.name,
            "lastname"          : req.body.lastname,
            "regis_date"        : req.body.regis_date,
            "browser"           : req.body.browser,
            "device"            : req.body.device,
            "ip_user"           : req.headers['x-forwarded-for'],
            "id_reference"      : req.body.id_reference,
            "name_reference"    : req.body.name_reference,
        }

        // console.log(item.ip);
    
        let sql = "INSERT INTO sign_festival SET ?"
    
        db.query(sql,item,(error,results,fields)=>{
    
            if (error) return res.status(500).json({
                "status": 500,
                "message": "Internal Server Error" // error.sqlMessage
            })
    
            datas = [{'id':results.insertId,...item}]
    
            sql = "SELECT COUNT(*) as sign_count FROM sign_festival WHERE id_festival = " +req.body.id_festival
    
            db.query(sql, (err,rows,fields) => {
    
                // if(err) throw err;
    
                const result = {
                    "status"    :  200,
                    "data"      : datas,
                    "counter"   : rows[0].sign_count
                }
    
                return res.json(result)
            })

        }) 
        
    } catch (error) {
        console.log(error);
    }

});

// reference festival
app.get('/api/get/Festival', auth, (req,res) => {

    try {
        const sql = 'SELECT id, name FROM list_festival'

        db.query(sql, function (err, results, fields) {

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

    } catch (error) {
        console.log(error);
    }
});

app.get('/api/get/listReference', auth, (req,res) => {

    try {
        const sql = 'SELECT id, name, tag_festival  FROM reference_festival'

        db.query(sql, function (err, results, fields) {

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

    } catch (error) {
        console.log(error);
    }
});


app.post('/api/create/reference', async (req, res) => {
    try {

        let item = {
            "name"          : req.body.name,
            "tag_festival"  : req.body.tag_festival,
            "create_by"     : req.body.user_id,
            "create_date"   : date,
            "modified_by"   : req.body.user_id,
            "modified_date" : date
        }

        let sql = "INSERT INTO reference_festival SET ?"

        db.query(sql, item, (error,results,fields) => {

            console.log(error);

            if (error) return res.status(500).json({
                "status": 500,
                "message": "Internal Server Error" // error.sqlMessage
            })

            console.log(results);

            data = [{'id':results.insertId, ...item}]

            console.log(data);
            const result = {
                "status": 200,
                "data": data
            }

            return res.json(result)

        })

    } catch (error) {
        console.log(error);
    }
});

app.post('/api/edit/reference', async (req, res) => {
    try {

        let item = {
            "name"          : req.body.name,
            "tag_festival"  : req.body.tag_festival,
            "modified_by"   : req.body.user_id,
            "modified_date" : date
        }

        console.log(req.body);

        let sql = "UPDATE reference_festival SET ? WHERE id = " +req.body.id

        db.query(sql, item, (error,results,fields) => {

            console.log(error);

            if (error) return res.status(500).json({
                "status": 500,
                "message": "Internal Server Error" // error.sqlMessage
            })

            console.log(results);

            const result = {
                "status": 200,
                "data": results
            }

            return res.json(result)

        })

    } catch (error) {
        console.log(error);
    }
});
app.post('/api/update/selectReference', async (req, res) => {
    try {

        let item = {
            // "name"          : req.body.name,
            "tag_festival"  : req.body.tag_festival,
            "modified_by"   : req.body.user_id,
            "modified_date" : date
        }

        let sql = "UPDATE reference_festival SET ? WHERE id = " +req.body.id

        db.query(sql, item, (error,results,fields) => {

            console.log(error);

            if (error) return res.status(500).json({
                "status": 500,
                "message": "Internal Server Error" // error.sqlMessage
            })

            console.log(results);

            const result = {
                "status": 200,
                "data": results
            }

            return res.json(result)

        })

    } catch (error) {
        console.log(error);
    }
});

app.get('/api/get/reference', auth, (req,res) => {
    try {
        const sql = 'SELECT id, tag_festival, name, create_date FROM reference_festival'

        db.query(sql, function (err, results, fields) {

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
    } catch (error) {
        
    }
});


app.get('/api/get/detailReference/:id', (req,res) => {
    try {

        const sql = "SELECT id,  name, tag_festival FROM reference_festival  WHERE tag_festival LIKE " + `'%"${req.params.id}"%'`

        db.query(sql, function (err, results, fields) {
            
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
    } catch (error) {
        
    }
});


app.post('/api/update/deleteReference', auth, (req,res) => {
    
    try {

        
        let item = {
            "tag_festival"  : req.body.tag_festival,
            "modified_by"   : req.body.user_id,
            "modified_date" : date
        }

        let sql = "UPDATE reference_festival SET ? WHERE id = " +req.body.id

        db.query(sql, item, (error,results,fields)=>{
    
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

    } catch (error) {
        console.log();
    }
  
 
});


// // user //
app.post('/api/createUser', auth, async (req,res)=> { 

    try {

        // const hashedPassword = await bcrypt.hash(req.body.password, 10)

        let user = {
            "username"      : req.body.username,
            // "password"      : hashedPassword,
            // "username_ad"   : req.body.username_ad,
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
    } catch (err) {

        console.log(err);
        
    }

});

app.post('/api/updateUser', auth, async (req,res)=> { 

    try {

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
        
    } catch (error) {
        console.log(error);
    }

});

app.post('/api/deleteUser', auth, (req, res)=>{

    try {
        let user = {
            "state"         : req.body.state,
            "status"        : req.body.status,
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
    } catch (error) {

        console.log(error);
        
    }

})

app.post('/api/getUserDetail/:id', auth, (req,res)=> { 

    try {

        const  id  = req.params.id;

        const sql = 'SELECT id, username, name, lastname, position, divisions, roles, detail, status, state, create_by, create_date, modified_by, modified_date FROM user_festival WHERE id = ?';

        db.query(sql, id, function (err, results, fields) {

            console.log(err);

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
        
    } catch (error) {
       console.log(error); 
    }

});

app.post('/api/welcome', auth, (req, res) => {
    // res.status(200).send('Hello');
    res.send('Hello');
})

function apiResponse(results){
    return JSON.stringify({"status": 200, "error": null, "response": results});
}

app.listen(5000,()=>{
    console.log('Server is listening on port 5000...')
})

