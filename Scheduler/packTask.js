//var fs=require('fs');
//var moment = require('moment');

const HOUR = 60;
const DAY = 1440;
const MS = 1000;
const DIF = 540;

var options = JSON.parse(window.localStorage.getItem("options"));
var dayLimit = 360;
var conLimit = options.conLimit * 60;
var border = 60;

//日時をUNIX時間に変換
function getUnixTime(date){
	var ndate = exchangeTime(date);
	var new_date = new Date(new Date(ndate).toUTCString());
	//var new_date = new Date(ndate);
	//console.log(new_date.toUTCString());
	return Math.floor(new_date.getTime() / MS / HOUR);
}

//配列の要素全てをUNIX時間に変換
function getUnixTimeArray(arr){
	for(var i = 0; i<arr.length; i ++){
		arr[i].start = getUnixTime(arr[i].start);
		arr[i].end = getUnixTime(arr[i].end);
	}
	return arr;
}

//UNIX時間の差分を計算
function compareUnixTime(date, date2){
	return Math.abs(date2 - date);
}

//UNIX時間を日時に変換
function parseUnixTime(date){
	return new Date(date * MS * HOUR);
}

//配列の要素全てを日時に変換
function parseUnixTimeArray(arr){
	for(var i = 0; i < arr.length; i ++){
		arr[i].start = parseUnixTime(arr[i].start);
		arr[i].end = parseUnixTime(arr[i].end);
	}
	return arr;
}

//予定のUNIX時間を昇順でソート
function sortUnixTime(arr){
	arr.sort(function (a, b){
		if( a.start < b.start ) return -1;
		if( a.start > b.start ) return 1;
		return 0;
	});
	return arr;            
}

//予定の日時のリストをUNIX時間のリストに変換
function getUnixTimeSet(arr){
	var new_arr = [];
	for(var i = 0; i < arr.length; i++){
		var start = getUnixTime(arr[i].start);
		var end = getUnixTime(arr[i].end);
		var obj = { "start":start, "end":end, "state":arr[i].state};
		new_arr.push(obj);
	}
	new_arr = sortUnixTime(new_arr);
	return new_arr;
}

//現在の日時から締め切りまでに存在する予定を抽出
function extraction(arr, sp, ep){
	var new_arr = [];
	for(var i = 0; i < arr.length; i++){
		if(arr[i].start > ep){
			break;
		}
		if(arr[i].start < ep && arr[i].end > sp){
			new_arr.push(arr[i]);
		}
	}
	return new_arr;
}

//現在の日時から締め切りまでに存在する空き時間を抽出
function findEmpty(arr, sp, ep){
	var empty = [];
	var ss = "";
	//document.write(parseUnixTime(sp));
	for(var i = 0; i < arr.length; i++){
		if(options.option3 == false){
			if(ss == "task" || arr[i].state == "task"){
				console.log("skip");
				if(ss == "task"){
					console.log(parseUnixTime(arr[i-1].start));
				}
				if(arr[i].state == "task"){
					console.log(parseUnixTime(arr[i].start));
				}
				if(arr[i].end > sp && arr[i].end > sp && arr[i].start < ep){
					sp = arr[i].end
					ss = arr[i].state;
				}		
				continue;
			}
		}
		var obj = {
			start: parseUnixTime(sp),
			end: parseUnixTime(arr[i].start)
		}
		if(arr[i].end > sp && arr[i].end > sp && arr[i].start < ep){
			empty.push(obj);
			sp = arr[i].end
			ss = arr[i].state;
		}
	}
	if(sp < ep){
		empty.push({ start: parseUnixTime(sp), end: parseUnixTime(ep) });
	}
	console.log(empty);
	return empty;
}

//空き時間にタスクに費やす時間を詰め込む
function packTaskByFragment(arr, require, limit){
	var count = 0;
	var req = 0;
	var total = 0;
	var taskSet = [];
	var free = [];
	var requireSet = [];
	var fragment = divideTask(require,limit);
	req = fragment[0];
	var res =  packFragment(arr, fragment);
	taskSet = res.task;
	free = res.free;
	var len = fragment.length - taskSet.length;
	var range = fragment.length;
	total = req * taskSet.length;
	while(1){
		if(total >= require) break;
		res = revenge(free, req, len);
		req = res.fragment;
		free = res.free;
		total += req * res.task.length;
		taskSet = taskSet.concat(res.task);
		len = res.len;
		if(req < 30) break;//return taskSet;
	}
	var result = {shortage: require - total, task: taskSet};
	return result;
}

//再分割
function revenge(arr, require, len){
	var fragment = [];
	for(var i = 0; i < len * 2; i ++){
		fragment.push(require / 2);
	}
	var res =  packFragment(arr, fragment);
	res.len = res.task.length;
	res.fragment = require / 2;
	return res;
}

//断片を空き時間に詰め込む
function packFragment(arr, fragment){
	var count = 0;
	var taskSet = [];
	var free = [];
	for(var i = 0; i < arr.length; i++){
		var sp = getUnixTime(arr[i].start);
		var ep = getUnixTime(arr[i].end);
		if(ep - sp >= fragment[count]){
			//return arr[i];
			if(count < fragment.length){
				var mergin = ((ep - sp) - fragment[count]) / 2;
				if((ep - mergin) - (sp + mergin) > border){
					var obj = {
						start: parseUnixTime(sp + mergin),
						end: parseUnixTime(ep - mergin),
						color: '#dc143c'
					}
					count ++;
					taskSet.push(obj);
				}
			}
		}
		else{
			free.push(arr[i]);
		}
	}
	return {task: taskSet, free:free}
}

//所要時間が上限以下になるまで分割する
function divideTask(require, limit){
	var arr = [];
	var count = 1;
	while(require > limit){
		require /= 2;
		count += count;
	}
	for(var i = 0; i < count; i ++){
		arr.push(require);
	}
	return arr;
}

function packTaskTightly(arr, require, mergin, limit){
	var task = {task: [], shortage: 0};
	for(var i = 0; i < arr.length; i++){
		if(require <= 0){
			break;
		}
		else{
			var sp = getUnixTime(arr[i].start);
			var ep = getUnixTime(arr[i].end);
			var sut = sp;
			var eut = ep;
			var cut = 0;
			while(sut + mergin * 2 < ep){
				cut = 0;
				var t = (eut - mergin - cut) - (sut + mergin);
				if(require - t <= 0) {
					//mergin = ((eut - sut) - require) / 2;
				}
				if(t > limit){
					cut = t - limit;
				}
				var obj = {
					start: parseUnixTime(sut + mergin),
					end: parseUnixTime(eut - mergin - cut),
					color: '#dc143c'
				};
				var len = (eut - mergin - cut) - (sut + mergin);
				if(len >= border){
					task.task.push(obj);
					//require -= len;
					require -= len;
					sut = eut - mergin - cut;
				}
				else{
					break;
				}
			}
		}
	}
	task.shortage = require;
	return task;
}

//始点から終点までの日数を計算する
function getDays(start,end){
	var sTime,sFraction,eTime,eFraction,dis,span;
	start = exchangeTime(start);
	sTime = new Date(start);
	sFraction = DAY - (sTime.getHours() * HOUR + sTime.getMinutes());
	end = exchangeTime(end);
	eTime = new Date(end);
	eFraction = eTime.getHours() * HOUR + eTime.getMinutes();
	start = getUnixTime(start);
	end = getUnixTime(end);
	dis = compareUnixTime(start,end);
	dis = dis - (sFraction + eFraction);
	span = dis / DAY;
	return span + 2;
}

//日付を整形する
function exchangeTime(text){
	text = text.toString();
	var new_text = "";
	for(var i = 0; i < text.length; i++){
		if(text[i] == '.'){
			break;
		}
		if(text[i] == 'T' && i > 0){
			if(isNaN(Number(text[i-1])) == false){
				new_text += ' ';
				continue;
			}
		}
		if(text[i] == '-'){
			new_text += '/';
		}
		else{
			new_text += text[i];
		}
	}
	return new_text;
}

/*
var json=[{"end":"2016-12-04T13:00:00","start":"2016-12-04T08:00:00","title":"event"},{"end":"2016-12-04T22:30:00","start":"2016-12-04T18:00:00","title":"event2"},{"end":"2016-12-05T12:30:00","start":"2016-12-05T08:00:00","title":"event3"},{"end":"2016-12-05T23:00:00","start":"2016-12-05T19:00:00","title":"event4"},{"end":"2016-12-06T11:00:00","start":"2016-12-06T05:00:00","title":"event5"},{"end":"2016-12-06T18:30:00","start":"2016-12-06T15:00:00","title":"event6"},{"end":"2016-12-06T23:00:00","start":"2016-12-06T20:30:00","title":"event7"},{"end":"2016-12-07T13:30:00","start":"2016-12-07T08:30:00","title":"event8"},{"end":"2016-12-07T22:00:00","start":"2016-12-07T18:30:00","title":"event9"},{"end":"2016-12-08T13:30:00","start":"2016-12-08T06:30:00","title":"event10"},{"title":"event11","start":"2016-12-03T09:00:00","end":"2016-12-03T13:00:00"}];
var new_json=getUnixTimeSet(json);
var startPoint=getUnixTime("2016-12-04T15:00:00");
var endPoint=getUnixTime("2016-12-08T18:00:00");
new_json=extraction(new_json, startPoint, endPoint);
new_json=findEmpty(new_json, startPoint, endPoint);
console.log(packTask(new_json,180).start);
*/


