//var electron = require('electron');
//var ipc = require('electron').ipcRenderer;
//var Dialogs = require('dialogs');
//var dialogs = Dialogs();
var routine;
var localEvent;
var options = JSON.parse(window.localStorage.getItem("options"));
var ignoring = 0;
if(options.option1) ignoring += 1;
if(options.option2) ignoring += 2;
var isExtend = options.option0;
var readCount = 0;
var taskSchedule = [];

/*ipc.send("readJson-order","/Calendar/routine");
ipc.on('/Calendar/routine-reply', function(response,arg) {
	routine = arg;
	//readReport();
});

ipc.send("readJson-order","/Calendar/localEvent");
ipc.on('/Calendar/localEvent-reply', function(response,arg) {
	localEvent = arg;
	//readReport();
});*/

init();

function init(){
	routine = window.localStorage.getItem("routine");
	localEvent = window.localStorage.getItem("localEvent");
	taskSchedule = window.localStorage.getItem("taskSchedule");
	if(routine == null || routine == ""){
		routine = []; 
	}
	else{
		routine = JSON.parse(routine);
	}
	if(localEvent == null || localEvent == ""){
		localEvent = [];
	}
	else{
		localEvent = JSON.parse(localEvent);
	}
	if(taskSchedule == null || taskSchedule == ""){
		taskSchedule = [];
	}
	else{
		taskSchedule = JSON.parse(taskSchedule);
	}

	for(var i = 0; i < taskSchedule.length; i ++){
		for(var j = 0; j < taskSchedule[i].task.length; j ++){
			taskSchedule[i].task[j].start = parseUnixTime(getUnixTime(taskSchedule[i].task[j].start) + 540),
			taskSchedule[i].task[j].end = parseUnixTime(getUnixTime(taskSchedule[i].task[j].end) + 540)
		}
	}

	for(var i = 0; i < taskSchedule.length; i ++){
		localEvent = localEvent.concat(taskSchedule[i].task);
	}
}

function readReport(){
	readCount ++;
	if(readCount >= 2){
		pack();
		readCount = 0;
	}
}

function pack(title,lim,req){
	init();
	var start = new Date();//"2016-12-04T15:00:00";
	var end = lim;//"2016-12-08T24:00:00";
	var require = req;
	//var startPoint=getUnixTime("2016-12-04T15:00:00");
	//var endPoint=getUnixTime();
	mergeEvent(title,start,end,localEvent,routine,require,1);
}

function mergeEvent(title,start,end,arr,tt,require,mode){
	var startPoint = getUnixTime(start);
	var endPoint = getUnixTime(end);
	var table = [];
	arr = getUnixTimeSet(arr);
	arr = extraction(arr,startPoint,endPoint);
	var timetable = packTimetable(startPoint,endPoint,arr,tt,mode);
	arr = timetable.total;
	arr = sortUnixTime(arr);
	console.log(arr);
	arr = findEmpty(arr,startPoint,endPoint);
	var limit = conLimit;
	var task = packTaskByFragment(arr,require,limit);
	//var task = packTaskTightly(arr,1100,30,conLimit);
	if(isExtend){
		while(task.shortage > 0 && limit < 480){
			limit *= 1.5;
			if(limit > 480) limit = 480;
			task = packTaskByFragment(arr,require,limit);
			//task = packTaskTightly(arr,1100,30,conLimit);
		}
	}
	if(task.shortage > 0){
		if(mode != 1 || ignoring == 0){
			alert("現状では約"+Math.round(task.shortage / 60) + "時間を組み込めません\nスケジュールの見直しを推奨します");
		}
		else{
			mergeEvent(title,start,end,localEvent,routine,require,1 + ignoring);
			return;
		}
	}
	else{
		alert("タスクスケジュールを更新しました");
		var obj = {};
		var id = window.localStorage.getItem("id");
		obj.id = id;
		obj.title = title;
		obj.state = "task";
		obj.require = require;
		obj.limit = end;
		for(var i = 0; i < task.task.length; i ++){
			task.task[i].state = "task";
			task.task[i].title = title;
			task.task[i].id = id;
		}
		obj.task = task.task;
		//taskSchedule.push(obj);
		pushTaskSchedule(obj);
		localEvent = localEvent.concat(task.task);
		id ++;
		//console.log(JSON.parse(JSON.stringify(taskSchedule)));
		window.localStorage.setItem("id",id);
		window.localStorage.setItem("taskSchedule",JSON.stringify(taskSchedule));
	}
	//new_table = parseUnixTimeArray(timetable.table);
	//draw(task.task.concat(localEvent).concat(new_table),start);
}

function pushTaskSchedule(obj){
	for(var i = 0; i < taskSchedule.length; i ++){
		if(taskSchedule[i].title == obj.title){
			taskSchedule[i].task = taskSchedule[i].task.concat(obj.task);
			return;
		}
	}
	taskSchedule.push(obj);
}

function draw(task,start){
	$('#calendar').fullCalendar({
		lang: "ja",
		selectable: true,
		selectHelper: true,
		navLinks: true,
		defaultDate: start,
		header: {
			left: 'prev,next today',
			center: 'title',
			right: 'month,agendaWeek,agendaDay'
		},
		events:task,
		select: function(start, end) {
			dialogs.prompt("件名",function(et){
				var title = et;
				var eventData;
				title = checkOverlap(title);
				if (title) {
					eventData = {
						id: 0,
						title: title,
						start: start,
						end: end
					};
					$('#calendar').fullCalendar('renderEvent', eventData, true); // stick? = true
				}
				$('#calendar').fullCalendar('unselect');
				if(title != null){
					localEvent.push(eventData);
					ipc.send("writeJson-order",{path:"/Calendar/localEvent", data:JSON.stringify(localEvent)});
				}
			});
		}
	});
}