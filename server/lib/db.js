//EXAMPLE file for creating a db model for SQL interfacing
const mysql = require('mysql');
const database_name = 'bats';
let dbConn;
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
		UNIQUE KEY (token)
	);
`;

/* Statement to create the 'tags' table. */
const TAGS_TABLE = `
	CREATE TABLE IF NOT EXISTS tags (
		id BIGINT NOT NULL AUTO_INCREMENT,
		token_id BIGINT NOT NULL,
		name VARCHAR(512) NOT NULL,
		value TEXT NULL,
		created TIMESTAMP NOT NULL,
		PRIMARY KEY (id),
		FOREIGN KEY (token_id) REFERENCES tokens (id) ON DELETE CASCADE,
		UNIQUE KEY (name, token_id)
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
options.host = process.env.DB_HOST || 'localhost';
options.user = process.env.DB_USERNAME || 'root';
options.password = process.env.DB_PASSWORD || 'test_pwd'; // See run-tests.sh
options.port = process.env.DB_PORT || '3307';
options.database = process.env.DB_NAME || database_name;

const connect = async () => {
	/* Create a new MySQL connection instance. */
	const conn = mysql.createConnection(options);

	/* Connect to the database. */
	console.log('Connecting to remote database');
	const promise = new Promise((resolve, reject) => {
		conn.connect(async err => {
			if (err) {
				console.error(`error connecting: ${err.stack}`);
				reject();
				return;
			}
			console.log(`Connected to database as id ${conn.threadId}`);
			resolve();
		});
	});
	await promise;

	for (var i in TABLES) {
		await conn.query(TABLES[i], (err) => {
			if (err) console.log(err);
		});
	}
	return conn;
};

/* Helper function to execute queries. */
db.executeQuery = (query, queryParams) => {
	return new Promise(async (resolve) => {
		if (!dbConn) {
			dbConn = await connect();
		}
		dbConn.query(query, queryParams, (err, results) => {
			if (err) console.log(err);
			resolve(results);
		});
	}).catch(e => console.log(e));
}

module.exports = db;
