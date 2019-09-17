const express = require('express');
const moment = require('moment');
const { executeQuery } = require('../lib/db');
const router = express.Router();
const uuidv4 = require('uuid/v4');

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
router.post('/:organization', async (req, res) => {
  //var organization = req.body["organization"];
  organization = req.params.organization;
  //checks and handles if the organization making the post request already has an existing token/account with us
  already_exist = await check_organizational_existance(organization);
  console.log(already_exist);
  if (already_exist == true){
    res.send({"Status": "Failure", 
      "Message": `Your organization, ${organization}, already has an account/token`});
  }
  console.log("Pass");
  //The user is new and thus we generate a new token for them
  var new_token = uuidv4();
  const query = `INSERT INTO tokens (token, organization, issued) VALUES ('${new_token}', '${organization}', CURRENT_TIMESTAMP())`;
  const results = await executeQuery(query); //Executes query
  //returns the json of new record that was inserted into the table
  res.send({"Status": "Success", "Token": new_token});
});

router.get('/dbstatus', async (req, res) => {
  const query = `SELECT * FROM tokens`;
  const results = await executeQuery(query); //Executes query
  //returns the json of new record that was inserted into the table
  res.send(results);
});

async function check_organizational_existance(org_name){
  //This function is used to check if an organization exist within our Tokens table
  const query = `SELECT * FROM tokens WHERE organization='${org_name}'`;
  const results = await executeQuery(query); //Executes query
  console.log(results)
  return results == undefined? false : results.length != 0? true : false;
}

async function check_token_existance(token_val){
  //This function is used to check if an organization exist within our Tokens table
  const query = `SELECT * FROM tokens WHERE token='${token_val}'`;
  const results = await executeQuery(query); //Executes query
  return results == undefined? false : results.length != 0? true : false;
}

module.exports = router;