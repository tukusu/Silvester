const weekday = [ "日", "月", "火", "水", "木", "金", "土" ] ;
var start = "2016-12-24T12:00:00";
var end = "2016-12-27T12:00:00";
//var sDay = new Date(exchangeTime(start)).getDay();
var sTime = new Date(exchangeTime(start));
var sFraction = DAY - (sTime.getHours() * HOUR + sTime.getMinutes());

var options = JSON.parse(window.localStorage.getItem("options"));
var night ={
	entrance: options.bedTime * 60,
	exit: (options.bedTime * 60 + options.sleepTime * 60) - ((options.bedTime * 60 + options.sleepTime * 60) - 1440)
}
var morning = {
	entrance: 0,
	exit: options.sleepTime * 60 - (night.exit - night.entrance)
}

console.log(night,morning);

var tableColor = 'green';

function packTimetable(start,end,arr,tt,mode){
	if(mode == 4){
		return {total: arr, table: []};
	}
	var sp = parseUnixTime(start);
	var ep = parseUnixTime(end);
	var days = getDays(sp,ep);
	var defTime = getDefaultTime(sp);
	var sDay = new Date(exchangeTime(sp)).getDay();
	var table = [];
	for(var i = 0; i < days; i ++){
		var next = defTime + i * DAY;
		if(mode != 2){
			for(var j = 0; j < tt[(sDay + i) % 7].length; j++){
				var obj ={
					start: next + tt[(sDay + i) % 7][j].start,
					end: next + tt[(sDay + i) % 7][j].end,
					color: tableColor
				}
				table.push(obj);
			}
		}
		if(mode != 3){
			var sleepM ={
				start: next + morning.entrance,
				end: next + morning.exit,
				color: tableColor
			}
			var sleepN ={
				start: next + night.entrance,
				end: next + night.exit,
				color: tableColor
			}
			table.push(sleepM);
			table.push(sleepN);
		}
	}
	//console.log(parseUnixTimeArray(table));
	return {total: arr.concat(table), table: table};
}

function getDefaultTime(date){
	date = exchangeTime(date);
	var ndate = new Date(date);
	//var fraction = DAY - (ndate.getHours() * HOUR + ndate.getMinutes());
	var fraction =(ndate.getHours() * HOUR + ndate.getMinutes());
	return getUnixTime(date) - fraction;
}