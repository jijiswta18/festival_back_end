var express = require('express');
var router  = express.Router();


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('router users.js');
});




module.exports = router;
