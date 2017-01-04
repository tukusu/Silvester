// This program is a simple implementation of a key logger for OS X.
// This key loggger requires sudo and outputs key codes and a time stamp to standard output.
//
// build: cc keylogger.c -o keylogger -framework ApplicationServices
// usage: sudo keylogger > keylogger.log
// author: Masayuki Higashino

#include <stdio.h>
#include <time.h>
#include <ApplicationServices/ApplicationServices.h>

int num,mv,mvs,sw,sws=0;

CGEventRef on_tap(CGEventTapProxy proxy, CGEventType type, CGEventRef event, void *refcon) {
  //CGKeyCode key = CGEventGetIntegerValueField(event, kCGKeyboardEventKeycode);
  time_t now; time(&now);
  //printf("%d %d\n", (int)now, key); fflush(stdout);
  //printf("\n%d\n",num);
  if(type==kCGEventKeyDown){
    num++;
    printf("\n%d", num);
  }
  if(type==kCGEventLeftMouseDown){
    for(int i=0;i<5;i++){
      printf("\n%d", num);
    }
  }
  if(type==kCGEventRightMouseDown){
    for(int i=0;i<5;i++){
      printf("\n%d", num);
    }
  }
  if(type==kCGEventMouseMoved){
    mv++;
    if(mv%10==0){
      mvs++;
      printf("%d\n",mvs);
    }
  }
  if(type==kCGEventScrollWheel){
    sw++;
    if(sw%5==0){
      sws++;
      printf("%d\n",sws);
    }
  }
  fflush(stdout);
  return event;
}

int main(int argc, const char * argv[]) {
  CGEventFlags flags = CGEventSourceFlagsState(kCGEventSourceStateCombinedSessionState);
  CGEventMask mask = CGEventMaskBit(kCGEventKeyDown);
  CFMachPortRef tap = CGEventTapCreate(kCGSessionEventTap, kCGHeadInsertEventTap, 0, mask, on_tap, &flags);
  if (!tap) {
    fprintf(stderr, "This program requires sudo.");
    return -1;
  }
  mask = CGEventMaskBit(kCGEventKeyDown) |
  CGEventMaskBit(kCGEventLeftMouseDown) | 
  CGEventMaskBit(kCGEventRightMouseDown) | 
  CGEventMaskBit(kCGEventMouseMoved) |
  CGEventMaskBit(kCGEventScrollWheel);
  tap = CGEventTapCreate(kCGSessionEventTap, kCGHeadInsertEventTap, 0, mask, on_tap, &flags);
  CFRunLoopSourceRef runloop = CFMachPortCreateRunLoopSource(kCFAllocatorDefault, tap, 0);
  CFRunLoopAddSource(CFRunLoopGetCurrent(), runloop, kCFRunLoopCommonModes);
  CGEventTapEnable(tap, true);
  CFRunLoopRun();
  printf("%d\n",0);
  return 0;
}