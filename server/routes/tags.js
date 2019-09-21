const express = require('express');
const moment = require('moment');
const { executeQuery } = require('../lib/db');
const router = express.Router();


//Checks that all 'api/tag' request are made with the Bearer Auth'
router.use("/", async (req, res, next) => {
  if (!res.locals.token) {
    res.send({"Status": "Failure", 
      "Result": 'No credentials sent!'});
  }
  else if (res.locals.token_id < 0) {
    res.send({"Status": "Failure", 
      "Result": 'Invalid credentials sent!'});
  }
  else next();
});


/*
  User creates/updates a specific tag/interaction
  Request: POST /api/tags/<name>?interaction=""
  Response: 500 internal server error, 200: body = {“Tags”: [ 
      {“name”, “users.user1”, “value”: “myval”, “interactions”: {“Button Click”: 4}, “created”: “created”},
    ]
  } 
*/
router.post("/:name", async (req, res) => {
  const tag_name = req.params.name;
  const interaction = req.query.interaction;
  const value = req.query.value;
  const token_id = res.locals.token_id;
  var query = `INSERT IGNORE INTO tags (tags.token_id, tags.name, tags.value, tags.created) VALUES (${token_id}, '${tag_name}', '${value}', CURRENT_TIMESTAMP())`;
  const tag_results = await executeQuery(query); //Executes query
  const tag_id = tag_results.insertId;
  var query = `INSERT INTO interactions (tag_id, action, time) VALUES ('${tag_id}', '${interaction}', CURRENT_TIMESTAMP())`;
  const interaction_results = await executeQuery(query); //Executes query
  //returns the json of new record that was inserted into the table
  res.send({"Status": "Successful", 
  "Result": tag_results});
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
    const token = res.locals.token;
    //The following SQL statement selects all tags with a name starting with "tag_name":
    var query = `SELECT * FROM tags, tokens WHERE token='${token}' AND tags.token_id = tokens.id AND tags.name LIKE '${tag_name}%'`;
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
  const token = res.locals.token;
  //If the tag name is  provided then we return the tag provided else we return all tags
  var query = `SELECT * FROM tags, tokens WHERE token='${token}' AND tags.token_id = tokens.id`;
  const results = await executeQuery(query); //Executes query
  //returns the json of new record that was inserted into the table
  res.send({"Status": "Successful", 
  "Result": results});
});

module.exports = router;