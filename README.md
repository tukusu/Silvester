#概要
SilvesterはOSX,macOS用タスクスケジュール管理アプリケーションです。  
スケジュール作成の補助、作業具合の監視を行い、ユーザーの作業効率を高める手助けをします。  
主な機能  
・タスク、スケジュールの作成と管理  
・PCの操作記録に基づく、ユーザーの集中度の提示  

#インストールと起動
1. [最新のSilvester](http://web.sfc.keio.ac.jp/~t13507rs/gp/Silvester.zip)をダウンロードします
2. ダウンロードフォルダにSilvester.appが追加されます
3. 必要であれば、Silvester.appをアプリケーションフォルダに移動します
4. controlキーを押しながらSilvester.appをクリックし、「開く」を押します
5. 確認のダイアログが表示されるので、「開く」を選択します
6. 表示されるダイアログに管理者パスワードを入力し、「ok」を押します(初回起動時のみ)

#タスクの作成
1. 「新規タスク」を押します  
2. タイトル、所要時間(時間単位)、期限を入力します  
3. スケジュールに十分な時間があれば、作成したタスクがスケジュールに追加されます。  
4. どうしてもタスクの追加に失敗する場合は、オプションから制限解除を行います  
  
[説明動画](http://web.sfc.keio.ac.jp/~t13507rs/gp/usage/addTaskUsage.mov)

#既存のタスクの管理
<タスクの開始>  
タスクは開始時間になると自動的に開始されますが、手動で開始することもできます  
タスクを開始すると、作業具合の監視が始まります  
  
手順  
1. 「タスク読込」を押します  
2. 開始したいタスクを選択し、「選択」を押します  
3. 「開始」を押します  
  
<タスクの中断>
タスクを開始している場合、「タスク読込」から中断することで、作業具合の監視を停止することができます  
  
手順  
1. 「測定中」もしくは集中度の表示がされていることを確認します  
2. 「中断」を押します  
  
<タスクの延長>  
既存のタスクの所要時間を延長したい場合は、「タスク読込」から延長を行うことができます  
なお、この操作はタスクの進行中は行うことができません。  
既にタスクを開始している場合は、中断を行ってください。

手順  
1. 「タスク読込」を押します  
2. 延長したいタスクを選択します  
3. 「選択」を押します  
4. 「延長」を押して、表示されたダイアログに時間単位で延長時間を入力します(負の値をいれると短縮できます)  
5.  延長に十分な時間があれば、タスクの所要時間が更新されます  
6. タスクの追加に失敗する場合は、オプションから制限解除を行います  
  
<タスクの終了>
タスクを終了することで、タスクの管理と監視を終了することができます  
終了したタスクは、スケジュール上からも削除されます  
  
手順  
1. 「タスク読込」を押します  
2. 延長したいタスクを選択します  
3. 「終了」を押します  
4. 確認のダイアログが表示されるので、「ok」を押します  
  
[説明動画](http://web.sfc.keio.ac.jp/~t13507rs/gp/usage/loadTaskUsage.mov)

#スケジュールの作成
カレンダー上で予定を追加することができます    
タスクは手動で既存の予定と被らないように組まれるため、タスクの作成前に予定を追加することを推奨します  
  
手順  
1. 「カレンダー」を押すと、新しいウィンドウでカレンダーが表示されます  
2. 予定を追加したい日時をクリック、またはドラッグします  
3. タイトルを入力します  
4. 予定を削除したい場合は、予定をクリックします  
  
[説明動画](http://web.sfc.keio.ac.jp/~t13507rs/gp/usage/calendarUsage.mov)

#ルーチンの作成
授業など、特定の曜日の特定の時間に入ると決まっている予定は、ルーチンとして設定することができます  
ルーチンは一週間分を設定すると、スケジュール全体に反映されるため、活用すればスケジュール管理が楽になります  
なお、予定だけでなく、食事や遊びの時間など、タスクを追加されたくない時間を指定する手段としても使えます  
  
手順  
1. 「ルーチン」を押します  
2. カレンダーと同様の方法で、ルーチンとして登録したい日時を指定します  
3. タイトルを入力します  
4. ルーチンを削除したい場合は、ルーチンをクリックします  

[説明動画](http://web.sfc.keio.ac.jp/~t13507rs/gp/usage/routineUsage.mov)

#オプション
オプションを設定することで、タスクをスケジュールに追加する際のルールを定義できます  
  
各項目の説明  
・「就寝」、「睡眠時間」	就寝時間、睡眠時間を設定します。初期設定では、就寝、睡眠時間にはタスクは追加されません  
・「連続作業時間」		連続して作業を行える時間の上限を設定します。初期設定では、タスクは上限を超えないように割り振られます  
・「連続作業時間の解除を許可する」	タスクを割り振るのに十分な時間がない場合、連続作業時間を無視するか否か設定します  
・「ルーチンの解除を許可する」	タスクを割り振るのに十分な時間がない場合、ルーチンを無視するか否か設定します　　
・「睡眠時間の解除を許可する」	タスクを割り振るのに十分な時間がない場合、睡眠時間を無視するか否か設定します

#アンケート
卒業論文執筆のため、Silvesterの評価アンケートにご協力ください  
「アンケート」を押すと、別ウィンドウでアンケートページが開かれるので、回答をお願いします  
アンケートは匿名で集計されるため、個人情報が流出する恐れはありません