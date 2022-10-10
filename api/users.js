const express       = require('express')
const cors          = require('cors')
const auth          = require('../middleware/auth');

const router        = express.Router()
const db            = require('../config/db') // เรียกใช้งานเชื่อมกับ MySQL

router.use(cors({
    //"Access-Control-Allow-Origin": "https://forqueen.cgd.go.th",
origin: '*'

}));

router.route('/getUser')
    .get(auth, (req, res, next) => { 

        // แสดงข้อมูลทั้งหมด
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

        })
    })

router.get('/users/:id', (req, res, next) => { 

        const  id  = 7;

        // แสดงข้อมูลทั้งหมด
        const sql = 'SELECT * FROM user_festival WHERE id = ?';
       
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
    })


// router.route('/user/:id')
//     .all((req, res, next) => { 
//         // ตรวจสอบว่า  id ข้อมูลที่ส่งมา หรืออยู่ในฐานข้อมูลหรือไม่ 
//         // ถ้ามีส่งต่อไปดึงมาแสดง / แก้ไข / ลบ
//         next()
//     })
//     .get((req, res, next) => { 
//         // แสดงรายการข้อมูลจากฐานข้อมูลของ id ข้อมูลที่อต้กงาร
//         return res.json({})
//     })
//     .put(validation(schema),(req, res, next) => {   
//         // ทำการแก้ไขรายการข้อมูลของ id ข้อมูลที่ต้องการ จากฐานข้อมูล แล้วแสดงรายการข้อมูลที่แก้ไข
//         return res.json({})
//     })
//     .delete((req, res, next) => { 
//         // ทำการลบช้อมูลของ id ข้อมูลที่ต้องการ จากฐานข้อมูล แล้วแสดงข้อมูลที่เพิ่งลบ
//         return res.json({})
//     })
  
module.exports = router