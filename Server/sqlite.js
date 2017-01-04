var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('ques.db');

function (obj){
	db.serialize(function(){
		db.run("INSERT INTO  (content) VALUES (?)", req.body.content);
	});
}