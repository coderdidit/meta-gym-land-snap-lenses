// @input string customText
// @input Component.Text customHintTextObject
// @input SceneObject obj1
// @input SceneObject obj2
// @input int minDistance

function startCustomHint() {
    if (!script.customHintTextObject) {
        errorPrint("please provide customHintTextObject");
        return;
    }
    if (!script.customText) {
        errorPrint("please provide customText");
        return;
    }
    if (!script.obj1) {
        errorPrint("please provide obj1");
        return;
    }
    if (!script.obj1) {
        errorPrint("please provide obj1");
        return;
    }
    if (!script.minDistance) {
        errorPrint("please provide minDistance");
        return;
    }
    distanceHint(script.customText);
}

function errorPrint(message) {
    print("Error: [front_cam_hint], " + message);
}

function distanceHint(customMsg) {
    var distance = 0;
    var updateEvent = script.createEvent("UpdateEvent")
    updateEvent.bind(function(){
        distance = script.obj1.getTransform().getWorldPosition().distance(script.obj2.getTransform().getWorldPosition());
        if(distance < script.minDistance) {
            updateHintText(customMsg);
        } else {
            updateHintText("");
            
        }    
    });
    
    // turn off update event on back camera event
    var event = script.createEvent("CameraBackEvent");
    event.bind(function (eventData)
    {
        print("[front_cam_hint] back camera active");
        updateEvent.bind(function(){});
    });
}

function updateHintText(_text) {
    script.customHintTextObject.text = _text;
}


// Initialize hints
if( !script.initialized ) {

    // Create the hint component
    script.hintComponent = script.getSceneObject().createComponent( "Component.HintsComponent" );
    
    script.customHintText = script.getSceneObject().getComponent("Component.Text");
    
    // reset
    script.customHintTextObject.text = "";
    print("Start [front_cam_hint]");
    
    startCustomHint();
}

function manipEnd(eventData)
{
   print("end event")
}
var manipEndEvent = script.createEvent("ManipulateEndEvent");
manipEndEvent.bind(manipEnd);


