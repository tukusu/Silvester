var electron = require('electron');
var ipc=require('electron').ipcRenderer;
var Dialogs = require('dialogs');
var dialogs = Dialogs();
var jaEvent = [];
var localEvent = [];
var id = 0;
var events = [];
var routine = [];
var table = [];
var taskSchedule = [];
var showRoutine = false;

for(var i = 0; i < 7; i ++){
	routine.push(new Array());
}

/*ipc.send("readJson-order","/Calendar/localEvent");
ipc.on('/Calendar/localEvent-reply', function(response,arg) {
	localEvent=arg;
});

ipc.send("readID-order","/Calendar/timetable");
ipc.on('readID-reply', function(response,arg) {
	id = arg;
});*/
//window.localStorage.removeItem("localEvent");
//window.localStorage.removeItem("jaEvent");
localEvent = window.localStorage.getItem("localEvent");
jaEvent = window.localStorage.getItem("jaEvent");
routine = window.localStorage.getItem("routine");
taskSchedule = window.localStorage.getItem("taskSchedule");
id = window.localStorage.getItem("id");
id = Number(id);
if(localEvent == null || localEvent == ""){
	localEvent = [];
}
else{
	localEvent = JSON.parse(localEvent);
}
if(jaEvent == null || jaEvent == ""){
	jaEvent = [];
}
else{
	jaEvent = JSON.parse(jaEvent);
}
if(routine == null || routine == ""){
	routine = [];
	for(var i=0;i<7;i++){
		routine.push(new Array());
	}
}
else{
	routine = JSON.parse(routine);
}
if(id == null || isNaN(id) || id == ""){
	id = 0;
}
if(taskSchedule == null || taskSchedule == ""){
	taskSchedule = [];
}
else{
	taskSchedule = JSON.parse(taskSchedule);
}

console.log(localEvent,jaEvent);
events = jaEvent;

//console.log(events.concat(taskSchedule[0].task));
for(var i = 0; i < taskSchedule.length; i ++){
	events = events.concat(taskSchedule[i].task);
}
console.log(events);
draw();

//$(document).ready(function() {
function draw(){
	$(document).ready(function() {
	$('#calendar').fullCalendar({
		lang: "ja",
		timezone: 'local',
		selectable: true,
		selectHelper: true,
		navLinks: true,
		header: {
			left: 'prev,next today',
			center: 'title',
			right: 'month,agendaWeek,agendaDay'
		}
		,
		googleCalendarApiKey: 'AIzaSyBns_s6tLp3u9kBaKtDT3QfVUdS9X6kqYY',
		eventSources: 
		{
            googleCalendarId: 'ryomatukusu@gmail.com',
        }
        ,
		events:events,
		select: function(start, end) {
			dialogs.prompt("件名",function(et){
				var title = et;
				var eventData;
				title = checkOverlap(title);
				/*if (title) {
					eventData = {
						id: id,
						state: "event",
						title: title,
						start: start,
						end: end
					};
					$('#calendar').fullCalendar('renderEvent', eventData, true); // stick? = true
				}
				$('#calendar').fullCalendar('unselect');*/
				if(title != null){
					eventData = {
						id: id,
						state: "event",
						title: title,
						start: start,
						end: end
					};
					var utcEventData = {
						id: id,
						state: "event",
						title: title,
						start: parseUnixTime(getUnixTime(start) + 540),
						end: parseUnixTime(getUnixTime(end) + 540)
					}
					jaEvent.push(eventData);
					localEvent.push(utcEventData);
					$('#calendar').fullCalendar('renderEvent', eventData, true);
					$('#calendar').fullCalendar('unselect');
					//ipc.send("writeJson-order",{path:"/Calendar/localEvent", data:JSON.stringify(localEvent)});
					window.localStorage.setItem("jaEvent",JSON.stringify(jaEvent));
					window.localStorage.setItem("localEvent",JSON.stringify(localEvent));
					id ++;
					window.localStorage.setItem("id",id);
				}
			});
		},
		eventClick: function(event){
			dialogs.confirm('予定を削除しますか？',function (ok){
				if(ok){
					if(event.state == "event"){
						eraseEvent(event.id);
						$('#calendar').fullCalendar('removeEvents', event.id);
					}
				}
			});
		},
		viewRender: function (view, element) {
			if(showRoutine == true){
				addRoutine(view.start,view.end);
			}
        }
	});
	})
}

function eraseEvent(id){
	for(var i = 0; i < localEvent.length; i ++){
		if(localEvent[i].id == id){
			localEvent.splice(i,1);
			jaEvent.splice(i,1);
			break;
		}
	}
	window.localStorage.setItem("localEvent",JSON.stringify(localEvent));
	window.localStorage.setItem("jaEvent",JSON.stringify(jaEvent));
}

function addRoutine(start, end){
	var len = getDays(start, end);
	var sDay= new Date(start).getDay();
	var defTime = getDefaultTime(start);
	for(var i = 0; i < table.length; i ++){
		$('#calendar').fullCalendar('removeEvents', table[i].id);
	}
	table = [];
	for(var i = 0; i < len; i ++){
		next = defTime + i * 1440;
		for(var j = 0; j < routine[i % 7].length; j ++){
			var obj ={start: parseUnixTime(next + routine[i%7][j].start), end: parseUnixTime(next + routine[i%7][j].end), color: "green", id: 1000000};
			table.push(obj);
			$('#calendar').fullCalendar('renderEvent', obj, true);
		}
	}
	events = localEvent.concat(table).concat; 
	//console.log(events);
	//$('#calendar').fullCalendar( 'removeEventSource', events);
	//$('#calendar').fullCalendar('addEvents',localEvent + table);
	//$('#calendar').fullCalendar( 'rerenderEvents' );
	//draw();
}

function checkOverlap(title){
	var num = 0;
	for(var i = 0; i < localEvent.length; i ++){
		var plane = localEvent[i].title.replace(/[0-9]/g, "");
		if(title == plane){
			num ++;
		}
	}
	if(num > 0){
		title = title + num;
	}
	return title;
}

function changeShowRoutine(){
	switch(showRoutine){
		case false:
			showRoutine = true;
			var view = $('#calendar').fullCalendar('getView');
			addRoutine(view.start,view.end);
			document.getElementById("changeShowRoutine").value = "ルーチンを非表示";
			break;
		case true:
			showRoutine = false;
			if(table.length > 0){
				for(var i = 0; i < table.length; i ++){
					$('#calendar').fullCalendar('removeEvents', table[i].id);
				}
				table = [];
			}
			document.getElementById("changeShowRoutine").value = "ルーチンを表示";
			break;
	}
}

function save(){
	alert($('#calendar').fullCalendar);
}