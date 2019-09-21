const express = require('express');
const moment = require('moment');
const { executeQuery } = require('../lib/db');
const router = express.Router();


//Checks if the request is made with a valid Bearer Auth'
router.use("/", async (req, res, next) => {
    const token = res.locals.token = get_authorization_token(req.headers.authorization);
    if(token){
      res.locals.token_id = await check_token_existance(token);
    }
    next();
  });

  function get_authorization_token(bearer_token){
    return !bearer_token? undefined: bearer_token.split(" ")[1];;
  }
  
  async function check_token_existance(token){
    //This function is used to check if an organization exist within our Tokens table
    const query = `SELECT id, token FROM tokens WHERE token='${token}'`;
    const results = await executeQuery(query); //Executes query
    return !results && !results[0] ? -1 : results[0].id;
  }

  module.exports = router;