const express = require('express');
const router = express.Router();
const uuid = require('uuidv4').default;
const db = require('../lib/db');

/* Returns the information of a specific token entity. */
router.get('/:token', async (req, res) => {
  /* Tip! Queries tend to be long, so go to menu at top of vs code View > Toggle Word Wrap. */
  const token = req.params.token;
  const query = `SELECT organization, issued FROM tokens WHERE token='${token}';`;
  const results = await db.executeQuery(query);
  if (results.length == 0) {
    res.status(404);
    res.send({code: 404, message: `Cannot locate token ${token} in our database.`});
    return;
  }
  res.status(200);
  res.send(results[0]);
});

/* Returns all tokens in our database. */
router.get('/', async (req, res) => {
  const query = `SELECT token, organization, issued FROM tokens ORDER BY issued DESC;`;
  const results = await db.executeQuery(query);
  if (results.length == 0) {
    res.status(404);
    res.send({code: 404, message: `Cannot locate any tokens in our database.`});
    return;
  }
  res.status(200);
  res.send(results);
});

/* Create a token. */
router.post('/', async (req, res) => {
  const organization = req.body.organization;
  /* Checks and handles if the organization making the post request already has an existing token/account with us. */
  const org_token = await router.check_organizational_existence(organization);
  if (org_token) {
    res.status(409); // 409 conflict error
    res.send({code: 409, message: `Your organization, ${organization}, already has an account.`});
    return;
  }
  /* The user is new and thus we generate a new token for them. */
  const new_token = uuid();
  const query = `INSERT INTO tokens (token, organization, issued) VALUES ('${new_token}', '${organization}', CURRENT_TIMESTAMP());`;
  const results = await db.executeQuery(query);
  /* Returns the json of new record that was inserted into the table. */
  res.status(201)
  res.send({"organization": organization, "token": new_token});
});

/* Delete a token. */
router.delete('/', async (req, res) => {
  if (res.locals.token === undefined) {
    res.status(401);
    res.send({code: 401, message: 'No authentication provided.'});
  } 
  else if (res.locals.token_id == -1) {
    res.status(403);
    res.send({code: 403, message: 'Improper authentication provided.'});
  }
  // True if successful, Flase if not
  const result = await db.executeQuery(`DELETE FROM tokens WHERE id = ${res.locals.token_id};`);
  if (result){
    res.status(204);
    res.send();
  }
  else{
    res.status(500);
    res.send("Error: Unable to delete your account.");
  }
});

/* Checks if an organization exist within our Tokens table. */
router.check_organizational_existence = async function (org_name){
  const query = `SELECT token FROM tokens WHERE organization='${org_name}';`;
  const results = await db.executeQuery(query);
  return !results || !results[0] ? undefined : results[0].token;
}

module.exports = router;
