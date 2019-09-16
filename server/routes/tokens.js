const express = require('express');
const moment = require('moment');
const { executeQuery } = require('../lib/db');
const router = express.Router();


//This assumes you have setup the db.js fields to connect to your db
//example:  localhost:<port>/db/insert?username=<someName>&password=<somePassword>
router.get('/', async (req, res) => {

  //Tip! Queries tend to be long, so go to menu at top of vs code View > Toggle Word Wrap
  const query = `SELECT * FROM tokens WHERE name='${req.query}'`; 

  const results = await executeQuery(query); //Executes query

  res.send({
      results
  });

});


module.exports = router;