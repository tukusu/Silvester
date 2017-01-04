var exec = require('child_process').exec,child;

//child_process.exec関数を利用する
child = exec('echo s19941024 | sudo -S ./logger',function (error, stdout, stderr) {
	console.log('stdout: ' + stdout);
	console.log('stderr: ' + stderr);
	process.stdout.write("ok");
	if (error !== null) {
		console.log('exec error: ' + error);
	}
});




