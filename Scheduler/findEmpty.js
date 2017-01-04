const DAY=1440;
const HOUR=60;

function leap(y){
	n = 28 + (1 / (y % 4 + 1)) * (1 - 1 / (y % 100 + 1)) + (1 / (y % 400 + 1));
	return Math.floor(n);
}

function dateDis(date,date2){
	var dNum = [31,28,31,30,31,30,31,31,30,31,30,31];
	var dis = 0;
	var yDis = date2.year - date.year;
	var sy = 0;
	if(yDis > 0) sy = 1;
	date2.month = (yDis - 1) * 12 * sy + (date2.month + (12 - date.month) * sy + date.month * sy);
	var mDis = date2.month - date.month;
	var dDis = 0;
	for(var i = 0; i < mDis; i++){
		if((date.month - 1 + i) % 12 == 1){
			dNum[1]=leap(date.year+Math.floor(date2.month / 12));
		}
		dDis += dNum[(date.month - 1 + i) % 12];
	};
	date2.day = date.day + dDis - date.day + date2.day;
	date2.month = date.month;
	var tDis = DAY * (date2.day - date.day) - HOUR * date.time + HOUR * date2.time;
	return tDis;
}

var date={
	year:2016,
	month:2,
	day:21,
	time:10.5
}

var date2={
	year:2016,
	month:3,
	day:15,
	time:20
}

console.log(dateDis(date,date2));

/*var date = new Date( "2016-02-21 10:30:00" ) ;
var date2 = new Date( "2016-12-04T07:30:00" ) ;
var unixTimestamp = Math.floor( date.getTime() / 1000 / 60) ;
var unixTimestamp2 = Math.floor( date2.getTime() / 1000 / 60) ;
console.log(unixTimestamp2-unixTimestamp);*/