const express = require('express');
const moment = require('moment');
const { executeQuery } = require('../lib/db');
const router = express.Router();


//Checks that all 'api/tag' request are made with the Bearer Auth'
router.use("/", async (req, res, next) => {
  var token = req.headers.authorization;
  if (!token) {
    res.send({"Status": "Failure", 
      "Result": 'No credentials sent!'});
  }
  token = get_authorization_token(req.headers);
  const is_valid_token = await check_token_existance(token);
  if (!is_valid_token) {
    res.send({"Status": "Failure", 
      "Result": 'Invalid credentials sent!'});
  }
  else next();
});


/*
  User queries a specific tag
  Request: GET /api/tags/<name>
  Response: 500 internal server error, 200: body = {“Tags”: [ 
      {“name”, “users.user1”, “value”: “myval”, “interactions”: {“Button Click”: 4}, “created”: “created”},
    ]
  } 
*/

router.get("/:name", async (req, res) => {
    const tag_name = req.params.name;
    const token = get_authorization_token(req.headers);
    console.log(token);
    var query = `SELECT * FROM tags WHERE token_id='${token}' AND name='${tag_name}'`;
    const results = await executeQuery(query); //Executes query
    //returns the json of new record that was inserted into the table
    res.send({"Status": "Successful", 
    "Result": results});
});

/*
  User queries all their tags
  Request: GET /api/tags/<name>
  Response: 500 internal server error, 200: body = {“Tags”: [ 
      {“name”, “users.user1”, “value”: “myval”, “interactions”: {“Button Click”: 4}, “created”: “created”},
    ]
  } 
*/
router.get("/", async (req, res) => {
  const token = get_authorization_token(req.headers);
  //If the tag name is  provided then we return the tag provided else we return all tags
  var query = `SELECT * FROM tags WHERE token_id='${token}'`;
  const results = await executeQuery(query); //Executes query
  //returns the json of new record that was inserted into the table
  res.send({"Status": "Successful", 
  "Result": results});
});

function get_authorization_token(req_headers){
  bearer_token = req_headers.authorization;
  return !bearer_token? "": bearer_token.split(" ")[1];;
}

async function check_token_existance(token){
  //This function is used to check if an organization exist within our Tokens table
  const query = `SELECT * FROM tokens WHERE token='${token}'`;
  const results = await executeQuery(query); //Executes query
  return !results? false : results.length != 0? true : false;
}

module.exports = router;