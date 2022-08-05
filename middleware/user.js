// const db = require('./config/db');

// const getUsers = (req, res, next) => {
    
//     const sql = 'SELECT * FROM user_festival WHERE username = ?'; 

//     db.query(sql, [req.body.username], async function (err, result, fields) {

//         if (err) throw err;
//         console.log('===============',result);

//     });

//     return next();

// } 

// module.exports = getUsers;