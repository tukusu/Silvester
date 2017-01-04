var sec=0;
var count=0;
var measure=false;
var subject="";
var difficulty=0;
var deadLine=new Array();
var num=0;
var electron = require('electron');
var ipc=require('electron').ipcRenderer;
var Dialogs = require('dialogs');
var dialogs = Dialogs();
var received=false;
var averageTime=0;
var pastTaskNum=window.localStorage.getItem("pastTaskNum");
var timeRequied=0;
var term=300;
var charPerSec=3.33;
var esTimeRequired=1;
var concentrate={
	num:0,
	total:0,
	average:0,
	current:0,
	ratio:0,
	past:1,
	pastRatio:0,
	progress:0
}
var pass="";
var tryNum=0;
var sentinel;
var currentID = 0;
var codex;

/*ipc.send('getPassword-order',0);

ipc.on('getPassword-reply', function(event,arg) {
	pass=arg;
	ipc.send("startUpKeylogger-order",pass);
});*/

sentinel = setInterval('observe()',60000);

pass = window.localStorage.getItem("password");
ipc.send("startUpKeylogger-order",pass);

ipc.on('startUpKeylogger-failed', function(event,arg) {
	signInPrompt("管理者パスワードを入力してください");
});

function signInPrompt(msg){
	dialogs.prompt(msg,function(et){
		//ipc.send("signIn-order",et);
		//ipc.send("setPassword-order",et);
		pass = et;
		window.localStorage.setItem("password",et);
		ipc.send("startUpKeylogger-order",pass);
	});
}

ipc.on('signIn-result', function(event, arg) {
	if(arg){
		dialogs.alert("サインインしました");
		tryNum=0;
	}
	else{
		if(tryNum<1){
			signInPrompt("管理者パスワードを入力してください");
		}
		else{
			signInPrompt("パスワードが違います。再度入力してください");
		}
	}
	tryNum++;
});

//ipc.send("startUpKeylogger-order",0);
ipc.on('showMessage', function(event, arg) {
	dialogs.alert(arg);
});

ipc.on('errorMessage', function(event, arg) {
	alert(arg);
});

//alert(document.getElementById("progress").clientWidth/window.innerWidth)

if(pastTaskNum==null) pastTaskNum=0;
//alert(pastTaskNum);

//window.localStorage.clear();

if(window.localStorage.getItem("num")!=null){
	num=window.localStorage.getItem("num");
	//document.write("<div align='right'><h3>進行中のタスク</h3></div>");
}

for(var i=0;i<num;i++){
	if(window.localStorage.getItem("task"+i)!=null){
		//document.write("<div align='right'><input type='button'"+" value='"+window.localStorage.getItem("task"+i)+"' id='task"+i+"' onClick=loadTask(this)> </div>");
	}
}

function make(){
	//deadLine=new Array();
	subject=document.getElementById("subject").value.replace(/ /g,"").replace(/　/g,"");
	var limit = document.getElementById("datetimepicker").value;
	var require = document.getElementById("requireHour").value.replace(/ /g,"").replace(/　/g,"");
	if(subject == ""){
		alert("タイトルを入力してください");
		return 0;
	}
	else if(require == ""){
		alert("所要時間を入力してください");
		return 0;
	}
	else if(limit == ""){
		alert("期日を入力してください");
		return 0;
	}

	require = Number(require) * 60;
	//toHome();
	if(limit=="" || isNaN(new Date(limit))){
		var limit = new Date();
		limit = getUnixTime(limit) + 1440;
		limit = parseUnixTime(limit);
		limit = new Date(limit);
	}
	//window.localStorage.setItem("newLimit",limit);
	//window.localStorage.setItem("newRequire",require);
	pack(subject,limit,require);
}

function start(){
	startShowing();
}

function stop(){
	stopShowing();
}

function openCalendar(){
	ipc.send("openCalender-order",0);
}

function timetable(){
	ipc.send("openTimetable-order",0);
}

function option(){
	//ipc.send("setPassword-order","");
	//window.localStorage.removeItem("password");
	//window.localStorage.removeItem("localEvent");
	//window.localStorage.removeItem("jaEvent");
	//window.localStorage.removeItem("id");
	//window.localStorage.removeItem("routine");
	//window.localStorage.removeItem("timetable");
	if(measure == false){
		makeOptionRayout("board");
	}
}

function setPackOption(){
	var options = {};
	options.bedTime = Number(document.getElementById("bedTime").value);
	options.sleepTime = Number(document.getElementById("sleepTime").value);
	options.conLimit = Number(document.getElementById("conLimit").value);
	options.option0 =  document.getElementById("option0").checked;
	options.option1 =  document.getElementById("option1").checked;
	options.option2 =  document.getElementById("option2").checked;
	if(isNaN(options.bedTime)) options.bedTime = 23;
	if(isNaN(options.sleepTime)) options.sleepTime = 8;
	if(isNaN(options.conLimit)) options.conLimit = 3;
	window.localStorage.setItem("options",JSON.stringify(options));
	alert("設定を適用しました");
	console.log(options);
}

function score(){
	ipc.send("openPackTask-order",0);
}

function showTaskList(){
	if(measure == false){
		makeTaskList("board");
	}
}

function selectTask(){

	//load(document.getElementById("taskList").value);
	//toHome();
	if(measure == false){
		subject = document.getElementById("taskList").value;
		makeOperationRayout("board",subject);
	}
}

function extendWindow(){
	if(measure == false){
		MakeTaskRayout("board");
	}
}

function extendTask(){
	dialogs.prompt("何時間延長しますか？", function(et){
		if(et != undefined && et != null){
			et = shapeStrToNum(et);
			if(et.match(/^[-]?([1-9]\d*|0)(\.\d+)?$/)){
				et = Number(et);
				if(et > 0){
					//dialogs.alert(et + "時間延長しました");
					adjustTask(subject, et * 60);
				}
				else if(et < 0){
					//dialogs.alert(Math.abs(et) + "時間短縮しました");
					adjustTask(subject, et * 60);
				}
				else{
					dialogs.alert("変更はありません");
				}
			}
			else{
				dialogs.alert("入力文字列が不正です。延長に失敗しました");
			}
		}
	});
}

function shapeStrToNum(text){
	var escape = ['-','.',''];
	var shaped = "";
	for(var i = 0; i < text.length; i ++){
		if(text[i].match(/^[-]?([1-9]\d*|0)(\.\d+)?$/)){
			shaped += text[i];
		}
		else{
			for(var j = 0; j < escape.length; j ++){
				if(text[i] == escape[j]){
					shaped += text[i];
					break;
				}
			}
		}
	}
	return shaped;
}

function adjustTask(title, addition){
	var taskSchedule = getTaskSchedule();
	var limit;
	if(addition > 0){
		for(var i = 0; i < taskSchedule.length; i ++){
			if(taskSchedule[i].title == title){
				limit = taskSchedule[i].limit;
			}
		}
		pack(title, limit, addition);
	}
	else{
		var sacrifice = 0;
		addition = Math.abs(addition);
		root: for(var i = 0; i < taskSchedule.length; i ++){
			if(taskSchedule[i].title == title){
				for(var j = taskSchedule[i].task.length - 1; j >= 0; j --){
					var sp = new Date(taskSchedule[i].task[j].start).getTime() / (MS * HOUR);
					var ep = new Date(taskSchedule[i].task[j].end).getTime() / (MS * HOUR);
					console.log(sp,ep);
					//sp = getUnixTime(taskSchedule[i].task[j].start);
					//ep = getUnixTime(taskSchedule[i].task[j].end);
					if(addition - (ep - sp) >= 0){
						addition -= ep - sp;
						sacrifice ++;
					}
					else{
						ep -= addition;
						taskSchedule[i].task[j].end = parseUnixTime(ep);
						taskSchedule[i].task.splice(taskSchedule[i].task.length - sacrifice, sacrifice);
						break root;
					}
				}
			}
		}
		//console.log(sacrifice);
		window.localStorage.setItem("taskSchedule",JSON.stringify(taskSchedule));
		alert("タスクスケジュールを更新しました");
	}
}

function finish(){
	if(measure){
		stopShowing();
	}
	var taskSchedule = getTaskSchedule();
	for(var i = 0; i < taskSchedule.length; i ++){
		if(taskSchedule[i].title == subject){
			taskSchedule.splice(i,1);
			alert("「"+subject+"」を終了しました");
			window.localStorage.setItem("taskSchedule",JSON.stringify(taskSchedule));
			makeTaskList("board");
			break;
		}
	}
}

function loadTask(button){
	load(button.value);
}

function checkAverageTime(){
	var average=0;
	for(var i=0;i<pastTaskNum;i++){
		var tName = window.localStorage.getItem("pastTask"+i);
		average += window.localStorage.getItem(tName+":difficulty") / window.localStorage.getItem(tName+":time");
		//alert(average);
	}
	if(pastTaskNum>0){
		average/=pastTaskNum;
	}
	return average;
}

function calcRequiredTime(t,dif){
	var res = 0;
	if(t > 0){
		res = dif / t;
	}
	return res;
}

function startShowing() {
	if(measure==false){
		measure=true;
		ipc.send('updateTrayTitle-order', "測定中");
		//esTimeRequired=difficulty/charPerSec;
		PassageID = setInterval('showPassage()',1000);
		if(document.getElementById("concentration") != null){
			document.getElementById("concentration").innerHTML = "<h2 id=\"normalText\">測定中</h2>";
		}
	}
}
// 繰り返し処理の中止
function stopShowing() {
	if(measure==true){
		measure=false;
		clearInterval( PassageID );
		//save(subject,time,count,difficulty,deadLine);
		ipc.send('updateTrayTitle-order', "休憩中");
		if(document.getElementById("concentration") != null){
			document.getElementById("concentration").innerHTML = "<h2 id=\"normalText\">休憩中</h2>";
		}
	}
}
// 繰り返し処理の中身
function showPassage() {
	sec++;
	//document.getElementById("time").innerHTML="time: "+sec+"sec";
	if(sec%term==0){
		emmit();
	}
}


/*document.onkeydown=function(){
	if(measure==true){
		count++;
		document.getElementById("count").innerHTML="count: "+count;
	}
}*/

function save(sub,time,count,dif,dead){
	num=0;
	if(window.localStorage.getItem("num")!=null){
		num=window.localStorage.getItem("num");
	}
	window.localStorage.setItem(sub,sub);
	window.localStorage.setItem(sub+":time",sec);
	window.localStorage.setItem(sub+":count",count);
	window.localStorage.setItem(sub+":difficulty",dif);
	window.localStorage.setItem(sub+":deadLine",dead);
	for(var i=0;i<num;i++){
		if(window.localStorage.getItem("task"+i)==subject){
			break;
		}
		if(i==num-1){
			alert("新しいタスク「"+sub+"」が追加されました");
			window.localStorage.setItem("task"+num,sub);
			num++;
			window.localStorage.setItem("num",num);
		}
	}
	if(num==0){
		alert("新しいタスク「"+sub+"」が追加されました");
		window.localStorage.setItem("task"+num,sub);
		num++;
		window.localStorage.setItem("num",num);
	}
}

function load(sub){
	subject=window.localStorage.getItem(sub);
	sec=window.localStorage.getItem(sub+":time");
	count=window.localStorage.getItem(sub+":count");
	difficulty=window.localStorage.getItem(sub+":difficulty");
	//document.getElementById("time").innerHTML="所要時間: "+sec+"sec";
	//document.getElementById("count").innerHTML="タイプ数: "+count;
	var temp="";
	deadLine=window.localStorage.getItem(sub+":deadLine");
	//document.getElementById("deadText").innerHTML="期限: "+deadLine;
	//document.getElementById("difText").innerHTML="文字数: "+difficulty;
	//document.getElementById("subject").innerHTML="<h1>"+sub+"</h1>";
}

function emmit(){
	ipc.send('asynchronous-message', { value:1, value2:0});
	if(received==false){
		ipc.on('asynchronous-reply', function(response,arg) {
			//document.getElementById("count").innerHTML="count: "+concentrate.total;
			concentrate.calcConcentrate(arg);
			ipc.send('asynchronous-message', { value:0, value2:0});
			received=true;
		});
	}
	received=false;
}

concentrate.calcConcentrate = function(arg){
	if(this.past==0) this.past=1
	this.num++;
	this.total+=arg;
	this.average=this.total/this.num;
	this.current=arg;
	this.ratio=(this.current/this.past)*(this.past/this.average);
	//document.getElementById("concentrate").innerHTML="集中度: "+this.ratio;
	//this.progress+=(difficulty*(term/esTimeRequired))*this.ratio;
	//document.getElementById("progress").innerHTML="推定進捗: "+Math.floor(this.progress)+"/"+difficulty;
	this.past=this.current;
	this.pastRatio=this.ratio;
	ipc.send('updateTrayTitle-order', this.ratio);
	if(document.getElementById("concentration") != null){
		document.getElementById("concentration").innerHTML = "<h2 id=\"normalText\">" + (Math.floor(this.ratio*100) + "%")  + "</h2>";
	}
	//ipc.send("notification-order",Math.floor(this.ratio*100)+"%");
	var msg = selectByConcentration(Math.floor(this.ratio*100));
	var notice=new Notification("Silvester",{body:msg});
	notice.onclick = function (){
		ipc.send('showWindow-order',0);
	}
	//updateProgressBar(this.progress);
}

function updateProgressBar(arg){
	var rate=arg/difficulty;
	var percent=Math.round(rate*100);
	if(rate>100) rate=100;
	document.getElementById("progressBar").innerHTML=percent+"%";
	document.getElementById("progressBar").style.width=((document.getElementById("progress").clientWidth/window.innerWidth)*100)*rate+"vw";
	//document.getElementById("progressBar").style.backgroundColor="red";
}

function observe(){
	//alert();
	var taskSchedule = getTaskSchedule();
	var now = getUnixTime(new Date());
	for(var i = 0; i < taskSchedule.length; i ++){
		if(taskSchedule[i].state == "task" && subject != taskSchedule[i].title){
			for(var j = 0; j < taskSchedule[i].task.length; j ++){
				var sp = getUnixTime(taskSchedule[i].task[j].start) + 540;
				var ep = getUnixTime(taskSchedule[i].task[j].end) + 540;
				if(now >= sp && now <= ep){
					if(measure){
						stopShowing();
					}
					subject = taskSchedule[i].title;
					makeOperationRayout("board",subject);
					startShowing();
					var notice = new Notification("Silvester",{body:"「"+subject+"」を自動で開始しました"});
				}
			}
		}
	}
}

function getTaskSchedule(){
	var taskSchedule = window.localStorage.getItem("taskSchedule");
	if(taskSchedule == null || taskSchedule == ""){
		taskSchedule = [];
	}
	else{
		taskSchedule = JSON.parse(taskSchedule);
	}
	return taskSchedule;
}

ipc.on('asynchronous-message', function(event, arg) {
	alert();
});

function remove(){
	window.localStorage.clear();
}

window.onblur = function (){
	window.focus();
}

window.onfocus=function(){

}