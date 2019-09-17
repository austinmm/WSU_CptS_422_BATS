const express = require('express');
const moment = require('moment');
const { executeQuery } = require('../lib/db');
const router = express.Router();


//This assumes you have setup the db.js fields to connect to your db
//example:  localhost:<port>/db/insert?username=<someName>&password=<somePassword>
router.get('/', async (req, res) => {
  //Tip! Queries tend to be long, so go to menu at top of vs code View > Toggle Word Wrap
  const query = `SELECT * FROM tokens WHERE token='${req.query}'`; 

  const results = await executeQuery(query); //Executes query

  res.send({
      results
  });

});

/*
Request: POST /api/tokens, body={“organization”: “My Company Name”}
Response: 500, 202: {“id”: 0, “token”: “...”, “issued”: “datetime”}
*/
router.post('/', async (req, res) => {
  var organization = req.body.organization;
  //checks and handles if the organization making the post request already has an existing token/account with us
  already_exist = check_organizational_existance(organization);
  if (already_exist == true){
    res.send(`Your organization, ${organization}, already has an account`);
  }
  //The user is new and thhus we generate a new token for them
  var new_token = create_uuid_token()
  const query = `INSERT INTO tokens (token, organization, issued) VALUES ('${new_token}', '${organization}', CURRENT_TIMESTAMP())`;
  const results = await executeQuery(query); //Executes query
  //returns the json of new record that was inserted into the table
  res.send({
      results
  });

});

function check_organizational_existance(organization){
  //This function is used to check if an organization exist within our Tokens table
  const query = `SELECT * FROM tokens WHERE organization='${organization}'`;
  const results = await executeQuery(query); //Executes query
  return results.length != 0;
}

function create_uuid_token() {
  //https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}




module.exports = router;