var electron = require('electron');
var ipc = require('electron').ipcRenderer;
var Dialogs = require('dialogs');
var dialogs = Dialogs();
var timetable = [];
var routine = [];
var id  = 0;

for(var i=0;i<7;i++){
	routine.push(new Array());
}

/*ipc.send("readJson-order","/Calendar/timetable");
ipc.on('/Calendar/timetable-reply', function(response,arg) {
	timetable=arg;
});

ipc.send("readJson-order","/Calendar/routine");
ipc.on('/Calendar/routine-reply', function(response,arg) {
	routine=arg;
});

ipc.send("readID-order","/Calendar/timetable");
ipc.on('readID-reply', function(response,arg) {
	id = arg;
});*/

timetable = window.localStorage.getItem("timetable");
routine = window.localStorage.getItem("routine");
id = window.localStorage.getItem("id");
id = Number(id);
if(timetable == null || timetable == ""){
	timetable = [];
}
else{
	timetable = JSON.parse(timetable);
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

$(document).ready(function() {
	$('#calendar').fullCalendar({
		lang: "ja",
		selectable: true,
		selectHelper: true,
		navLinks: true,
		aspectRatio: 0.9,
		defaultDate: '2016-12-27',
		defaultView: 'agendaWeek',
		allDaySlot: false,
		events:timetable,
		header: {
			left: '',
			center: '',
			right: ''
		},
		select: function(start, end) {
			dialogs.prompt("件名",function(et){
				var title = et;
				var eventData;
				var sDate = getUnixTime(start);
				sDate = new Date( parseUnixTime(sDate - DIF) );
				var sDay = sDate.getDay();
				var eDate = exchangeTime(end);
				eDate = getUnixTime(eDate);
				eDate = new Date( parseUnixTime(eDate - DIF) );
				var eDay = eDate.getDay();
				if (title) {
					title = checkOverlap(title);
					eventData = {
						id: id,
						title: title,
						start: start,
						end: end
					};
					 // stick? = true
				}
				//dialogs.alert(new Date(exchangeTime(start))+" "+new Date(exchangeTime(end)));
				if(title != null){
					if(sDay == eDay){
						$('#calendar').fullCalendar('renderEvent', eventData, true);
						$('#calendar').fullCalendar('unselect');
						timetable.push(eventData);
						var nr = {
							id: id,
							title: title,
							day: sDay,
							start: sDate.getHours() * HOUR + sDate.getMinutes(),
							end: eDate.getHours() * HOUR + eDate.getMinutes()
						}
						routine[sDay].push(nr);
						id ++;
						/*ipc.send("writeJson-order",{path:"/Calendar/timetable", data:JSON.stringify(timetable)});
						ipc.send("writeID-order",id);
						ipc.send("writeJson-order",{path:"/Calendar/routine", data:JSON.stringify(routine)});*/
						window.localStorage.setItem("timetable",JSON.stringify(timetable));
						window.localStorage.setItem("routine",JSON.stringify(routine));
						window.localStorage.setItem("id",id);
					}
					else{
						dialogs.alert("日をまたぐルーチンは設定できません");
					}
				}

			});
		},
		eventClick: function(event){
			dialogs.confirm('「'+event.title+'」を削除しますか？',function (ok){
				if(ok){
					$('#calendar').fullCalendar('removeEvents', event.id);
					eraseTimetable(event.id);
				}
			});
		}
	});
})

function eraseTimetable(id){
	for(var i = 0; i < timetable.length; i ++){
		if(timetable[i].id == id){
			timetable.splice(i,1);
			break;
		}
	}
	for(var i = 0; i < routine.length; i ++){
		for(var j = 0; j < routine[i].length; i++){
			if(routine[i][j].id == id){
				routine[i].splice(j,1);
				break;
			}
		}
	}
	window.localStorage.setItem("timetable",JSON.stringify(timetable));
	window.localStorage.setItem("routine",JSON.stringify(routine));
}

function checkOverlap(title){
	var num = 0;
	for(var i = 0; i < timetable.length; i ++){
		var plane = timetable[i].title.replace(/[0-9]/g, "");
		if(title == plane){
			num ++;
		}
	}
	if(num > 0){
		title = title + num;
	}
	return title;
}

function save(){
	alert($('#calendar').fullCalendar);
}