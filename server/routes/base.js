const express = require('express');
const moment = require('moment');
const db = require('../lib/db');
const router = express.Router();

//Checks if the request is made with a valid Bearer Auth'
router.middelware_authorization = function(req, res, next) {
  res.locals.token = undefined;
  res.locals.token_id = -1;
  var token = router.get_authorization_token(req.headers.authorization);
  //removes spaces from bearer auth if any exist
  token = token.toString().split(' ').join('');
  if(token && token.length > 0){
    res.locals.token = token;
    router.check_token_existence(token).then(response => {
      res.locals.token_id = response;
    });
  }
  next();
}

router.get_authorization_token = function(bearer_token) {
  return bearer_token && typeof(bearer_token) === 'string'
         && bearer_token.includes('Bearer')? bearer_token.split(" ")[1]: "";
}

/* Checks if an organization exist within our Tokens table. */
router.check_token_existence = async function(token) {
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

/* Popular HTTP Status Code Meanings
  ##### 200's: Indicates that the client’s request was accepted successfully #####
  * 200 (OK): It indicates that the REST API successfully carried out whatever action the client requested and that no more specific code in the 2xx series is appropriate.

  * 201 (Created): Whenever a resource is created inside a collection. 

  * 202 (Accepted): Used for actions that take a long while to process. It indicates that the request has been accepted for processing, but the processing has not been completed.

  * 204 (No Content): Usually sent out in response to a PUT, POST, or DELETE request when the REST API declines to send back any status message or representation in the response message’s body.

  ##### 400's: This category of error status codes points the finger at clients #####
  * 400 (Bad Request): The generic client-side error status, used when no other 4xx error code is appropriate. Errors can be like malformed request syntax, invalid request message parameters, or deceptive request routing etc.

  * 401 (Unauthorized): Indicates that the client tried to operate on a protected resource without providing the proper authorization. It may have provided the wrong credentials or none at all. The response must include a WWW-Authenticate header field containing a challenge applicable to the requested resource.

  * 403 (Forbidden): Indicates that the client’s request is formed correctly, but the REST API refuses to honor it i.e. the user does not have the necessary permissions for the resource. 

  * 404 (Not Found): Indicates that the REST API can’t map the client’s URI to a resource but may be available in the future. 

  * 405 (Method Not Allowed): Indicate that the client tried to use an HTTP method that the resource does not allow.

  ##### 500's: The server takes responsibility for these error status codes #####
  * 500 (Internal Server Error): Generic REST API error response. Most web frameworks automatically respond with this response status code whenever they execute some request handler code that raises an exception.

  * 501 (Not Implemented): The server either does not recognize the request method, or it lacks the ability to fulfill the request. 
*/