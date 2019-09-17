//EXAMPLE file for creating a db model for SQL interfacing
const mysql = require('mysql');
const database_name = 'bats';
let conn;
let options = {};
let db = {};

/* Statement to create the 'tokens' table. */
const TOKENS_TABLE = `
	CREATE TABLE IF NOT EXISTS tokens (
		id BIGINT NOT NULL AUTO_INCREMENT,
		token CHAR(36) NOT NULL,
		organization VARCHAR(255) NOT NULL,
		issued TIMESTAMP NOT NULL,
		PRIMARY KEY (id),
		INDEX (token)
	);
`;

/* Statement to create the 'tags' table. */
const TAGS_TABLE = `
	CREATE TABLE IF NOT EXISTS tags (
		id BIGINT NOT NULL AUTO_INCREMENT,
		token_id BIGINT NOT NULL,
		name TEXT NOT NULL,
		value TEXT NULL,
		created TIMESTAMP NOT NULL,
		PRIMARY KEY (id),
		FOREIGN KEY (token_id) REFERENCES tokens (id) ON DELETE CASCADE
	);
`;

/* Statement to create the 'interactions' table. */
const INTERACTIONS_TABLE = `
	CREATE TABLE IF NOT EXISTS interactions (
		id BIGINT NOT NULL AUTO_INCREMENT,
		tag_id BIGINT NOT NULL,
		action VARCHAR(255) NOT NULL,
		time TIMESTAMP NOT NULL,
		PRIMARY KEY (id),
		FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
	);
`;

const TABLES = [TOKENS_TABLE, TAGS_TABLE, INTERACTIONS_TABLE];

/* Configure connection parameters. */
options.host = process.env.DB_HOST || '422-bats-mysql.mysql.database.azure.com';
options.user = process.env.DB_USERNAME || 'bats@422-bats-mysql';
options.password = process.env.DB_PASSWORD || '422pass123!';
options.port = process.env.DB_PORT || '3306';
options.database = process.env.DB_NAME || database_name;

/* Create a new MySQL connection instance. */
conn = mysql.createConnection(options);

/* Connect to the database. */
console.log('Connecting to remote database');
conn.connect(err => {
	if (err) {
		console.error(`error connecting: ${err.stack}`);
		return;
	}
	console.log(`connected as id ${conn.threadId}`);

	/* Create the database if it does not exist. Note: options.database must be ommited to
	   to run this step for the database to be created. */
	conn.query(`CREATE DATABASE IF NOT EXISTS ${database_name};`, (err) => {
		if (err) console.log(err);
	});

	/* Create the tables if they do not exist. */
	TABLES.forEach((stmt) => {
		conn.query(stmt, (err) => {
			if (err) console.log(err);
		});
	});
});

/* Helper function to execute queries. */
db.executeQuery = (query, queryParams) => {
	return new Promise((resolve, reject) => {
		conn.query(query, queryParams, (err, results) => {
			if (err) console.log (err);
			resolve(results);
		});
	}).catch(e => console.log(e));
}

module.exports = db;