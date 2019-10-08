const express = require('express');
const router = express.Router();
const uuid = require('uuidv4').default;
const db = require('../lib/db');
// const { executeQuery } = require('../lib/db');

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
  const org_token = await router.check_organizational_existance(organization);
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
router.delete('/:token', async (req, res) => {
  const token = req.params.token;
  let token_id = -1;
  if (token) {
    token_id = await router.check_token_existance(token);
  }
  console.log(token + " " + token_id);

  if (token_id == -1) {
    res.status(404);
    res.send({code: 404, message: `Cannot locate token ${token} in our database.`});
    return;
  }

  const result = await db.executeQuery(`DELETE FROM tokens WHERE id = ${token_id};`);
  console.log('---',result);
  res.status(200);
  res.send({});
});

/* Checks if an organization exist within our Tokens table. */
router.check_organizational_existance = async function (org_name){
  const query = `SELECT token FROM tokens WHERE organization='${org_name}';`;
  const results = await db.executeQuery(query);
  return !results || !results[0] ? undefined : results[0].token;
}

/* Checks if an organization exist within our Tokens table. */
router.check_token_existance = async function(token) {
  const query = `SELECT id FROM tokens WHERE token='${token}';`;
  const results = await db.executeQuery(query);
  try {
    return results[0].id;
  } catch (err) {
    return -1;
  }
}

module.exports = router;
