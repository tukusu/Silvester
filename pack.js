const project='Silvester';
const exec=require('child_process').exec;
const fs=require('fs');
const command = 'electron-packager . '+project+' --platform=darwin --arch=x64 --version=1.4.10 --overwrite --icon=images/'+project+'.icns --prune';
process.stdout.write("packaging electron-project ...");
const PATH = project+'-darwin-x64/';
const DOMAIN = 't13507rs@ccx01.sfc.keio.ac.jp:public_html/gp';

packaging();

//phase1
function packaging(){
	var cp =exec(command,function (err,stdout,stderr){
		console.log('  done');
		process.stdout.write("initializing localEvent.json ...");
		initializeCalendar();
	});
	cp.stdout.on('data',(data) => {
    	console.log(data);
  	});
}

//phase2
function initializeCalendar(){
	fs.writeFile(PATH+project+'.app/Contents/Resources/app/Calendar/localEvent.json',[],function (err,stdout,stderr){
		console.log('　done');
		removeLoggerSource();
	});
}

//phase3
function removeLoggerSource(){
	process.stdout.write("removing logger.c ...");
	exec('rm '+PATH+project+'.app/Contents/Resources/app/'+'/logger.c',function(){
		console.log('　done');
		chmodLogger();
	});
}

//phase4
function chmodLogger(){
	process.stdout.write("adding permission to logger ...");
	exec('echo s19941024 | sudo -S chmod a+wx '+PATH+project+'.app/Contents/Resources/app/'+'/logger',function(){
		console.log('　done');
		initializePassword();
	});
}

//phase5
function initializePassword(){
	process.stdout.write("initializing .pass.txt ...");
	fs.writeFile(PATH+project+'.app/Contents/Resources/app/log/.pass.txt',"",function (err,stdout,stderr){
		console.log('　done');
		chmodPassword();
	});
}

//phase6
function chmodPassword(){
	process.stdout.write("adding permission to .pass.txt ...");
	exec('echo s19941024 | sudo -S chmod a+rwx '+PATH+project+'.app/Contents/Resources/app/log'+'/.pass.txt',function (err,stdout,stderr){
		if(err) console.log(stderr);
		console.log('　done');
		zipApplication();
	});
}

//phase7
function zipApplication(){
	process.stdout.write("zipping application ...");
	var cp = exec('./zip.sh', function (err,stdout,stderr){
		console.log('　done');
		upload();
	});
	cp.stdout.on('data',(data) => {
    	console.log(data);
  	});
}

//phase8
function upload(){
	process.stdout.write("uploading application to CNS ...");
	exec('scp '+project+'.zip '+DOMAIN, function (err,stdout,stderr){
		console.log('　done');
		finish();
	});
}

//lastPhase
function finish(){
	console.log('\nsuceed to build and upload OSX application!');
	exec('open -R '+__dirname+'/'+project+'-darwin-x64/'+project+'.app');
}