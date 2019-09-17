const express = require('express');
const moment = require('moment');
const { executeQuery } = require('../lib/db');
const router = express.Router();
const uuid = require('uuid/v4');

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
  const organization = req.params.organization;
  //checks and handles if the organization making the post request already has an existing token/account with us
  already_exist = await check_organizational_existance(organization);
  if (already_exist == true){
    res.send({"Status": "Failure", 
      "Result": `Your organization, ${organization}, already has an account/token`});
  }
  //The user is new and thus we generate a new token for them
  const new_token = uuid();
  const query = `INSERT INTO tokens (token, organization, issued) VALUES ('${new_token}', '${organization}', CURRENT_TIMESTAMP())`;
  const results = await executeQuery(query); //Executes query
  //returns the json of new record that was inserted into the table
  res.send({"Status": "Successful", 
  "Result": {"ID": results.insertId, "Organization": organization, "Token": new_token}});
});

//helper endpoint to let anyone see all the entires in the tokens table
router.get('/', async (req, res) => {
  const query = `SELECT * FROM tokens`;
  const results = await executeQuery(query); //Executes query
  res.send(results);
});

async function check_organizational_existance(org_name){
  //This function is used to check if an organization exist within our Tokens table
  const query = `SELECT * FROM tokens WHERE organization='${org_name}'`;
  const results = await executeQuery(query); //Executes query
  return !results? false : results.length != 0? true : false;
}

module.exports = router;