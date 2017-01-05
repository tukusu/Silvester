function MakeTaskRayout(parent){
	var rayout = '<div id="optionSet"><CENTER>新規タスク作成</CENTER><br><div>タイトル: <input type="text" id="subject"></div>\
	<div id="thinText">所要時間: <input type="text" id="requireHour">時間\
	<div id="thinText">期限: <input type="text" id="datetimepicker"></div><br>\
	<CENTER><div><input type="button" value="登録" onClick="make()" class="btn"></div></CENTER></div>\
	<style>.xdsoft_datetimepicker .xdsoft_calendar th {font-size:10%;}</style>';

	document.getElementById(parent).innerHTML = rayout;

	jQuery.datetimepicker.setLocale('ja');
	jQuery('#datetimepicker').datetimepicker({
		step:30
	});
	var date = new Date();
	date = getUnixTime(date) + 1440;
	date = parseUnixTime(date);
	date = new Date(date);
	date="20"+(date.getYear()-100)+"/"+(date.getMonth()+1)+"/"+date.getDate()+" 00:00";
	document.getElementById("datetimepicker").placeholder=date;
	document.getElementById("board").style.opacity=1;
}

function makeTaskList(parent){
	var taskSchedule = window.localStorage.getItem("taskSchedule");
	if(taskSchedule == null || taskSchedule == ""){
		taskSchedule = [];
	}
	else{
		taskSchedule = JSON.parse(taskSchedule);
	}
	var code="<div id='selectList'><CENTER><div>タスク選択</div><br><br>";
	code+='<select id="taskList" size="1">';
	for(var i = 0; i < taskSchedule.length; i ++){
		if(taskSchedule[i].state == "task"){
			code+='<option value="'+taskSchedule[i].title+'" label="'+taskSchedule[i].title+'"></option>';
		}
	}
	code += '</select><br><br><div><br>\
	<input type="button" value="選択" onClick="selectTask()">\
	</div></CENTER></div>';
	document.getElementById(parent).innerHTML=code;
	document.getElementById("board").style.opacity=1;
}

function makeOperationRayout(parent,subject){
	var code='<CENTER><div id="normalText"><h2>'+subject+'</h2></div>\
	<div id="concentration"><h2 id="normalText">待機中</h2></div>\
	<input type="button" value="開始" onClick="start()">\
	<input type="button" value="中断" onClick="stop()">\
	<input type="button" value="延長" onClick="extendTask()">\
	<input type="button" value="終了" onClick="finish(subject,0)"></CENTER>';
	document.getElementById(parent).innerHTML=code;
	document.getElementById("board").style.opacity=1;
}

function makeOptionRayout(parent){
	var code = '<div id="optionSet">就寝: <input type="text" id="bedTime" class="timepicker">時　睡眠: <input type="text" id="sleepTime" class="timepicker">時間\
	<div>連続作業時間: <input type="text" id="conLimit" class="timepicker">時間\
	<div id="checkbox"><input id="option0" type="checkbox"><label for="option0">連続作業時間の延長を許可する</label></div>\
	<div id="checkbox"><input id="option1" type="checkbox"><label for="option1">ルーチンの解除を許可する</label></div>\
	<div id="checkbox"><input id="option2" type="checkbox"><label for="option2">睡眠時間の解除を許可する</label></div>\
	<div id="checkbox"><input id="option3" type="checkbox"><label for="option3">連戦を許可する</label></div>\
	<CENTER><input type="button" value="適用" onClick="setPackOption()"><input type="button" value="初期化" onClick="resetOption()"></CENTER></div>';
	var options = JSON.parse(window.localStorage.getItem("options"));
	document.getElementById(parent).innerHTML=code;
	document.getElementById("board").style.opacity=1;
	document.getElementById("bedTime").value = options.bedTime;
	document.getElementById("sleepTime").value = options.sleepTime;
	document.getElementById("conLimit").value = options.conLimit;
	document.getElementById("option0").checked = options.option0;
	document.getElementById("option1").checked = options.option1;
	document.getElementById("option2").checked = options.option2;
	document.getElementById("option3").checked = options.option3;
}