const express = require('express');
const router = express.Router();
const { executeQuery } = require('../lib/db');

/* Checks if the request is made with a valid Bearer Auth */
router.use('/', async (req, res, next) => {
  const token = res.locals.token = get_authorization_token(req.headers.authorization);
  if (token) {
    res.locals.token_id = await check_token_existance(token);
  }
  next();
});

function get_authorization_token(bearer_token) {
  return !bearer_token ? undefined : bearer_token.split(' ')[1];
}

/* Checks if an organization exist within our Tokens table. */
async function check_token_existance(token) {
  const query = `SELECT id FROM tokens WHERE token='${token}' LIMIT 1`;
  const results = await executeQuery(query);
  try {
    return results[0].id;
  } catch (err) {
    return -1;
  }
}

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
