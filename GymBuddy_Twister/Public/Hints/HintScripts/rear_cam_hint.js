// @input string customText
// @input Component.Text customHintTextObject
// @input int delayInSeconds
 
function startCustomHint() {
   if (!script.customText) {
       errorPrint("please provide customText");
       return;
   }
    if (!script.customHintTextObject) {
       errorPrint("please provide customHintTextObject");
       return;
   }
   if (!script.delayInSeconds) {
       errorPrint("please provide delayInSeconds");
       return;
   }
 
   var delayTime = script.delayInSeconds;
   var delayedEvent = script.createEvent("DelayedCallbackEvent");
   
   delayedEvent.bind(function(eventData) {
       script.customHintTextObject.text = "";
   });
      
   delayedEvent.reset(delayTime);
   script.customHintTextObject.text = script.customText;
}


function errorPrint(message) {
    print("Error: [rear_cam_hint], " + message);
}
 
 
// Initialize hints
if( !script.initialized ) {
 
   // Create the hint component
   script.hintComponent = script.getSceneObject().createComponent( "Component.HintsComponent" );
  
   script.customHintText = script.getSceneObject().getComponent("Component.Text");
    
   // reset
   script.customHintTextObject.text = "";
   print("Start [rear_cam_hint]");
 
   startCustomHint();
}
