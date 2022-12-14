const express       = require('express')
const cors          = require('cors')
const auth          = require('../middleware/auth')

const router        = express.Router()
const db            = require('../config/db') // เรียกใช้งานเชื่อมกับ MySQL

router.use(cors({
    //"Access-Control-Allow-Origin": "https://forqueen.cgd.go.th",
origin: '*'

}))

router.route('/getReportFestival')
    .get(auth, (req, res, next) => { 

        // แสดงข้อมูลทั้งหมด
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

        })
    })

router.route('/export_ffuagvylst/:id')
    .get(auth, (req, res, next) => { 

        // แสดงข้อมูลทั้งหมด
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
    })
router.route('/getNameFestival/:id')
    .get(auth, (req, res, next) => { 

        // แสดงข้อมูลทั้งหมด
        const sql = "SELECT name as name_festival FROM list_festival  WHERE id = " +req.params.id
        
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
    })

module.exports = router