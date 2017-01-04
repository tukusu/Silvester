var spawn=require('child_process').spawn;
process.stdout.write("s19941024\n");
var ls=spawn('sudo' , ['-S','./logger']);
var num=0;

ls.stdout.on('data',(data) => {
	num++;
	process.stdout.write(num+"\n");
});