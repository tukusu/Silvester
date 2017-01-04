'use strict';

var electron = require('electron');
var app = electron.app;
var BrowserWindow = electron.BrowserWindow;
var ipc = electron.ipcMain;
var spawn=require('child_process').execFile;
var exec=require('child_process').exec;
const notifier = require('node-notifier');
const path=require('path').resolve("");
var ls;
var mainWindow = null;
var num=0;
var dsw;
var fs=require('fs');
var menubar=require("menubar");
var mb=menubar({'transparent':true});
mb.setOption('width',300);
mb.setOption('height',420);
mb.setOption('showDockIcon',true);
var pass="";
var windows = {calendar: null, timetable: null, ques: null};

function setPassword(pass){
  //fs.writeFileSync(__dirname+'/log/.pass.txt',pass);
  //window.localStorage.setItem("password",pass);
}

function getPassword(){
  //return fs.readFileSync(__dirname+'/log/.pass.txt');
  //return window.localStorage.getItem("password");
}

function signIn(password,event){
  exec('echo '+password+' | sudo -k', function (err, stdout, stderr){
    exec('echo '+password+' | sudo -S chown root '+__dirname+'/logger', function (err, stdout, stderr){
      exec('echo '+password+' | sudo -S chmod a+s '+__dirname+'/logger', function (err, stdout, stderr){
        if(err){
          event.sender.send('errorMessage', stderr);
          event.sender.send('signIn-result', false);
        }
        else{
          startUpKeylogger();
          event.sender.send('signIn-result', true);
        }
      });
    });
  });
}

function startUpKeylogger(event,pw){
  //mb.showWindow();
  pass=pw;
  ls=exec('sudo -k | echo '+pw+' | sudo -S '+__dirname+'/logger',function (err,stdout,stderr){
    if(err){
      //event.sender.send('startUpKeylogger-failed');
      event.sender.send('signIn-result', false);
      return 0;
    }
    else{
    	event.sender.send('signIn-result', true);
    }
  });
  ls.stdout.on('data',(data) => {
    num++;
  });

  ls.stderr.on('data', function (data) {
    console.log('' + data);
  });
}

mb.on('ready', function ready () {
  mb.showWindow();
  mb.window.setResizable(false);
  mb.tray.setTitle("待機中");
  //mb.window.setTransparent(true);
})

mb.on('show', function (){
  for(var i in windows){
    if(windows[i] != null){
      windows[i].show();
    }
  }
})

app.on('before-quit', function(){
  for(var i in windows){
    if(windows[i] != null){
      windows[i].destroy();
      windows[i] = null;
    }
  }
  var killer = exec('echo '+pass+' | sudo -S kill '+(ls.pid+3),function (err,stdout,stderr){
    console.log("killing logger");
  })
})

app.on('window-all-closed', function() {
  if (process.platform != 'darwin')
    app.quit();
});

app.on('ready', function() {
});

app.on('activate',function(){
});

ipc.on('signIn-order', function(event, arg) {
  signIn(arg,event);
});

ipc.on('startUpKeylogger-order', function(event, arg) {
  startUpKeylogger(event,arg);
});

ipc.on('readJson-order', function(event, arg) {
  fs.readFile(__dirname+arg+'.json',function(err,data){
    if(data!=null&&data!="")event.sender.send(arg+'-reply',JSON.parse(data));
  })
});

ipc.on('writeJson-order', function(event, arg) {
  fs.writeFile(__dirname+arg.path+'.json',arg.data);
});

ipc.on('readID-order', function(event, arg) {
  fs.readFile(__dirname+'/Calendar/id.txt',function(err,data){
    if(data!=null&&data!="")event.sender.send('readID-reply',Number(data));
  })
});

ipc.on('writeID-order', function(event, arg) {
  fs.writeFile(__dirname+'/Calendar/id.txt',arg);
});

ipc.on('updateTrayTitle-order', function(event, arg) {
  if(isNaN(arg)){
    mb.tray.setTitle(arg);
  }
  else{
    mb.tray.setTitle(Math.floor(arg*100)+"%");
  }
});

ipc.on('notification-order', function(event, arg) {
  //exec("osascript -e 'display notification \""+arg+"\" with title \"TMABC\"'");
  notifier.notify({
    'title': 'TMABC',
    'message': arg,
    'icon': __dirname+'/plachta.png'
  });
});

ipc.on('showWindow-order', function(event, arg) {
  mb.showWindow();
});

ipc.on('setPassword-order', function(event, arg) {
  setPassword(arg);
});

ipc.on('getPassword-order', function(event, arg) {
  event.sender.send('getPassword-reply', getPassword());
});

ipc.on('extendWindow-order', function(event, arg) {
  var nw=new BrowserWindow({
    width: 300,
    height: 200,
    minWidth: 400,
    minHeight: 400,
    resizable: false,
    frame: true,
    transparent: false,
    frame:false,
    x:mb.getOption('windowPosition'),
    title: "Variable Calender"
  })
  nw.loadURL('file://' + __dirname + '/extend.html');
  mb.showWindow();
  nw.on("close",function(){
    mb.showWindow();
  })
});

ipc.on('openCalender-order', function(event, arg) {
  if(windows.calendar == null){
    var nw=new BrowserWindow({
      width: 800,
      height: 550,
      minWidth: 400,
      minHeight: 400,
      resizable: false,
      frame: true,
      transparent: false,
      alwaysOnTop: false,
      title: "Variable Calender"
    })
    nw.loadURL('file://' + __dirname + '/Calendar/calendar.html');
    mb.showWindow();
    windows.calendar = nw;
    nw.on("close",function(){
      mb.showWindow();
      windows.calendar = null;
    })
  }
});

ipc.on('openTimetable-order', function(event, arg) {
  if(windows.timetable == null){
    var nw=new BrowserWindow({
      width: 700,
      height: 750,
      minWidth: 400,
      minHeight: 400,
      resizable: false,
      frame: true,
      transparent: false,
      alwaysOnTop: false,
      title: "Timetable"
    })
    nw.loadURL('file://' + __dirname + '/Calendar/timetable.html');
    mb.showWindow();
    windows.timetable = nw;
    nw.on("close",function(){
      mb.showWindow();
      windows.timetable = null;
    })
  }
});

ipc.on('openPackTask-order', function(event, arg) {
  if(windows.ques == null){
    var nw=new BrowserWindow({
      width: 900,
      height: 580,
      minWidth: 400,
      minHeight: 400,
      resizable: false,
      frame: true,
      transparent: false,
      title: "Variable Calender"
    })
    nw.loadURL('https://docs.google.com/forms/d/e/1FAIpQLSffTkNsl4b9Zx9kygWnk5kGB_M8TKh7UefWm5zQjHBSxhyjMw/viewform');
    mb.showWindow();
    windows.ques = nw;
    nw.on("close",function(){
      mb.showWindow();
      nw.destroy();
      windows.ques = null;
    })
  }
});

ipc.on('asynchronous-message', function(event, arg) {
  switch(arg.value){
    case 0:
      num=arg.value2 + 1;
      break;
    case 1:
      event.sender.send('asynchronous-reply', num);
      break;
  }
});