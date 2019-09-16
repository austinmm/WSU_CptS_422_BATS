//EXAMPLE file for creating a db model for SQL interfacing
const mysql = require('mysql');
const database_name = 'bats';
let conn;
let options = {};
let db = {};

options.host = process.env.DB_HOST || '422-bats-mysql.mysql.database.azure.com';
options.user = process.env.DB_USERNAME || 'bats@422-bats-mysql';
options.password = process.env.DB_PASSWORD || '422pass123!';
options.port = process.env.DB_PORT || '3306';
options.database = process.env.DB_NAME || database_name;
console.log('Connecting to remote database');

conn = mysql.createConnection(options);

conn.connect(err => {
	if (err) {
		console.error(`error connecting: ${err.stack}`);
		return;
	}
	console.log(`connected as id ${conn.threadId}`);

	conn.query(`CREATE DATABASE IF NOT EXISTS ${database_name};`, (err, results) => {
		if (err) console.log(err);
	});
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