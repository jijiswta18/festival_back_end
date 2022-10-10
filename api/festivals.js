const express       = require('express')
const cors          = require('cors')
const auth          = require('../middleware/auth')

const router        = express.Router()
const db            = require('../config/db') // เรียกใช้งานเชื่อมกับ MySQL

router.use(cors({
    //"Access-Control-Allow-Origin": "https://forqueen.cgd.go.th",
origin: '*'

}))

router.route('/getFestival')
    .get(auth, (req, res, next) => { 

        // แสดงข้อมูลทั้งหมด
        const sql = 'SELECT * FROM list_festival ';

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
    
        })
    })

router.route('/getFestivalSign')
    .get(auth, (req, res, next) => { 

        // แสดงข้อมูลทั้งหมด
        const sql = 'SELECT * FROM list_festival WHERE status = 1 '

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
    
        })
    })

router.route('/getFestivalPreview/:id')
    .get(auth, (req, res, next) => { 

        console.log(req.params.id);

        // แสดงข้อมูลทั้งหมด

        const sql = "SELECT * FROM list_festival WHERE id = " +req.params.id

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

        })
    })





module.exports = router