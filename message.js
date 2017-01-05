function selectByConcentration(rate){
	var state = 0;
	if(rate >= 150){                                                 
		state = 0;
	}
	if(rate >= 100 && rate < 150){
		state = 1;
	}
	if(rate >= 60 && rate < 100){
		state = 2;
	}
	if(rate >= 20 && rate < 60){
		state = 3;
	}
	if(rate < 20){
		state = 4;
	}
	var msg = makeMessage(state);
	return msg;
}

function makeMessage(state){
	var ms0 = ["とてもいい調子ですね","すごい集中力です","とても頑張っていますね"];
	var ms1 = ["とても集中しているようですね","申し分ないですね","とてもいいペースです"];
	var ms2 = ["集中しているようですね","この調子で頑張りましょう","いいペースです"];
	var ms3 = ["ペースが落ちているようです","もう少し頑張りましょう","作業が遅れていませんか？"];
	var ms4 = ["ちゃんと作業していますか？","ペースがかなり落ちていますよ","もっと頑張れるはずです"];
	var arr = [ms0, ms1, ms2, ms3, ms4];
	var random = Math.floor( Math.random() * 3 );
	return arr[state][random];
}