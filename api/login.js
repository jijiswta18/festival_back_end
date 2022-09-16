const express   = require('express')
const cors      = require('cors');
const router    = express.Router()
const db        = require('../config/db') // เรียกใช้งานเชื่อมกับ MySQL

router.use(cors({
    //"Access-Control-Allow-Origin": "https://forqueen.cgd.go.th",
origin: '*'

}));

router.route('/login')
    .post(async (req, res, next) => { 

        
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

            }

          
    
        });
        
    } catch (error) {
        console.log(error);
    }

   
})
 


module.exports = router