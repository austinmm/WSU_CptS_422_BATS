const express = require('express');
const router = express.Router();
const db = require('../lib/db');

//Checks if the request is made with a valid Bearer Auth'
router.middelware_authorization = async (req, res, next) => {
  res.locals.token = undefined;
  res.locals.token_id = -1;
  var token = router.get_authorization_token(req.headers.authorization);
  //removes spaces from bearer auth if any exist
  token = token.toString().split(' ').join('');
  if(token && token.length > 0){
    res.locals.token = token;
    res.locals.token_id = await router.check_token_existance(token);
  }
  next();
}

router.get_authorization_token = (bearer_token) => {
  return bearer_token && typeof(bearer_token) === 'string'
         && bearer_token.includes('Bearer')? bearer_token.split(" ")[1]: "";
}

/* Checks if an organization exist within our Tokens table. */
router.check_token_existance = async (token) => {
  const query = `SELECT id FROM tokens WHERE token='${token}' LIMIT 1`;
  const results = await db.executeQuery(query);
  try {
    return results[0].id;
  } catch (err) {
    return -1;
  }
}

router.use("/", router.middelware_authorization);

module.exports = router;
