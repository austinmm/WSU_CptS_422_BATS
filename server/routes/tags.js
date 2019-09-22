const express = require('express');
const moment = require('moment');
const { executeQuery } = require('../lib/db');
const router = express.Router();


//Checks that all 'api/tag' request are made with the Bearer Auth'
router.use("/", async (req, res, next) => {
  if (!res.locals.token) {
    res.status(401);
    res.send('No authentication provided.');
  }
  else if (res.locals.token_id == 0) {
    res.status(403);
    res.send('Improper authentication provided.');
  }
  else next();
});


/*
  User creates/updates a specific tag/interaction
  Request: POST /api/tags/<name>?interaction=""
  Response: 500 internal server error, 200: body = {
    “tags”: { "id": ..., “name”, “...”, “value”: ...},
    “interactions”: {"id": ..., "action": “...”}
  }
*/
router.post("/:name", async (req, res) => {
  const tag_name = req.params.name;
  const interaction = req.query.interaction;
  const value = req.query.value;
  const token_id = res.locals.token_id;
  var response = undefined;
  try {
    var query = `INSERT IGNORE INTO tags (token_id, name, value, created) VALUES (${token_id}, '${tag_name}', '${value}', CURRENT_TIMESTAMP())`;
    var results = await executeQuery(query); //Executes query
    var tag_id = results.insertId;
    //Tag already exist so we need to obtain its 'id' to enter the new interaction 
    if(tag_id == 0){
      query = `SELECT id FROM tags WHERE name='${tag_name}'`;
      results = await executeQuery(query); //Executes query
      tag_id = results[0].id; 
    }
    query = `INSERT INTO interactions (tag_id, action, time) VALUES ('${tag_id}', '${interaction}', CURRENT_TIMESTAMP())`;
    results = await executeQuery(query); //Executes query
    res.status(201);
    response = {"tag": {"id": tag_id, "name": tag_name, "value": value}, "interaction": {"id": results.insertId, "action": interaction}};
  }
  catch(err) {
    response = err;
    res.status(500);
  }  
  //returns the json of new record that was inserted into the table
  res.send(response);
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
    if(results.length == 0){
      res.status(204);
      res.send(`Notice: You do not have any tags that begin with '${tag_name}'`);
    }
    else{
      res.status(200);
      res.send(results);
    }
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
  if(results.length == 0){
    res.status(204);
    res.send("Notice: You have not created any tags.");
  }
  else{
    res.status(200);
    res.send(results);
  }
});

module.exports = router;