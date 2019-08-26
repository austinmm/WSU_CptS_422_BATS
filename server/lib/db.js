//EXAMPLE file for creating a db model for SQL interfacing
const mysql = require('mysql');
const database_name = '';
let conn;
let options = {};
let db = {};

options.host = process.env.DB_HOST || 'localhost';
options.user = process.env.DB_USERNAME || 'root';
options.password = process.env.DB_PASSWORD || 'password';
options.port = process.env.DB_PORT || '3306';
options.database = database_name || 'firstDB';
console.log('Connecting to remote database');

conn = mysql.createConnection(options);

conn.connect(err => {
	if (err) {
		console.error(`error connecting: ${err.stack}`);
		return;
	}

	console.log(`connected as id ${conn.threadId}`);
});

db.executeQuery = (query, queryParams) => {
	return new Promise((resolve, reject) => {
		conn.query(query, queryParams, (err, results) => {
			if (err) console.log (err);
			resolve(results);
		});
	}).catch(e => console.log(e));
}

module.exports = db;