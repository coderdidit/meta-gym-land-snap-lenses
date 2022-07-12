// GestureController.js
// Version: 0.0.1
// Event: Lens Initialized
// Description: The script that controls body bones rotations and allows to compare current body pose with the presets specified in Pose Library
// Requires FullBodyTrackingController.js
// @ui {"widget":"label", "label" : "Tap To Capture Pose:"}
// @input bool tapPose {"label" : "Enabled"}
// @ui {"widget": "separator", "showIf" : "tapPose"}
// @ui {"widget":"label", "label":"To add custom gesture tap on the Preview Panel" , "showIf" : "tapPose"}
// @ui {"widget":"label", "label":"A gesture output will appear in the Logger Panel", "showIf" : "tapPose"}
// @ui {"widget":"label", "label":"Copy and paste new gesture to GestureController.js file", "showIf" : "tapPose"}

const FULL_BODY_BONE_IDs = ["LeftUpperarm", "LeftForearm", "RightUpperarm", "RightForearm", "LeftUpperLeg", "LeftLowerLeg", "RightUpperLeg", "RightLowerLeg", "Spine"];
const VEC2_UP = vec2.up();
const PI = Math.PI;

//----add custom body gesture here----
//---remove the bones you don't need

var PoseLibrary = {};

// To add custom pos:

PoseLibrary.HANDS_UP = {"LeftUpperarm":"1.281","LeftForearm":"0.438","RightUpperarm":"-1.358","RightForearm":"-0.323"}
PoseLibrary.RIGHT_HAND_UP = {"LeftUpperarm":"0.739","LeftForearm":"0.715","RightUpperarm":"1.096","RightForearm":"0.049"}
PoseLibrary.LEFT_HAND_UP = {"LeftUpperarm":"-0.977","LeftForearm":"-0.203","RightUpperarm":"-0.817","RightForearm":"-0.677"}

//----do not edit below this line----

//create bones from TrackingPoints
// Define Bone function 
function Bone(id, start, end, parent) {
    this.name = id;
    this.parent = parent;
    this.start = start;
    this.end = end;
}

Bone.prototype.isTracking = function() {
    return this.start.isTracking() && this.end.isTracking();
};

Bone.prototype.getRotation = function() {
    var startPos = this.start.getWorldPosition();
    var endPos = this.end.getWorldPosition();
    var dir = new vec2(endPos.x, endPos.y).sub(new vec2(startPos.x, startPos.y)).normalize();
    var parentDir = VEC2_UP;
    if (this.parent) {
        var parentPos = this.parent.getWorldPosition();
        parentDir = new vec2(startPos.x, startPos.y).sub(new vec2(parentPos.x, parentPos.y)).normalize();
    }
    return Math.atan2(parentDir.x * dir.y - parentDir.y * dir.x, parentDir.dot(dir));
};

// Create Body Bones from TrackingPoints
var BT = global.FullBodyTracking;
if (!BT) {
    debugPrint("ERROR, please make sure that FullBodyTrackingController script exists and is higher in hierarchy");
    return;
}

var Bones = {};

Bones.Spine = new Bone("Spine", BT.Hip, BT.Neck);

Bones.LeftUpperarm = new Bone("LeftUpperarm", BT.LeftShoulder, BT.LeftElbow, BT.Neck);
Bones.RightUpperarm = new Bone("RightUpperarm", BT.RightShoulder, BT.RightElbow, BT.Neck);

Bones.LeftForearm = new Bone("LeftForearm", BT.LeftElbow, BT.LeftWrist, BT.LeftShoulder);
Bones.RightForearm = new Bone("RightForearm", BT.RightElbow, BT.RightWrist, BT.RightShoulder);

Bones.LeftUpperLeg = new Bone("LeftUpperLeg", BT.LeftHip, BT.LeftKnee, BT.Hip);
Bones.RightUpperLeg = new Bone("RightUpperLeg", BT.RightHip, BT.RightKnee, BT.Hip);

Bones.LeftLowerLeg = new Bone("LeftLowerLeg", BT.LeftKnee, BT.LeftAnkle, BT.LeftHip);
Bones.RightLowerLeg = new Bone("RightLowerLeg", BT.RightKnee, BT.RightAnkle, BT.RightHip);

// returns current pose object
function getCurrentPose() {
    var pose = {};
    for (var i = 0; i < FULL_BODY_BONE_IDs.length; i++) {
        var id = FULL_BODY_BONE_IDs[i];
        var rotation = Bones[id].getRotation();
        pose[id] = rotation.toFixed(3);
    }
    return pose;
}

// prings current pose
function printPose() {
    if (BT.isTracking()) {
        debugPrint("Copy and paste this pose to GestureController.js file");
        print(JSON.stringify(getCurrentPose()));
    } else {
        debugPrint("WARNING, Body is not tracking, can't get current pose");
    }
}

//creates pose object from the json string
function poseFromJson(poseJsonString) {
    var pose = {};
    try {
        var parsedJson = poseJsonString;
        for (var boneName in parsedJson) {
            pose[boneName] = parseFloat(parsedJson[boneName]);
        }
        return pose;
    } catch (e) {
        debugPrint("ERROR, " + e);
        return null;
    }
}

//checks whether current body pose is matching pos with given threshold
function isMatchingPose(pose, threshold) {
    if (!BT.isTracking()) {
        return false;
    }
    
    var bonesCheckedCount = 0;
    var accumulatedAngleDiff = 0;
    
    for (var boneName in pose) {
        if (Bones[boneName].isTracking()) {
            accumulatedAngleDiff += getDifference(pose[boneName], Bones[boneName].getRotation()) / PI;           
        } else {
            return false;
        }
        
        bonesCheckedCount++;
    }
    
    return (accumulatedAngleDiff / bonesCheckedCount) < threshold;
}

function getDifference(x, y) {
    var a = x - y;
    a += (a > PI) ? -2 * PI : (a < -PI) ? 2 * PI : 0;
    return Math.abs(a);
}

//returns a list of poses (a Gesture) from the library by names
function getGestureFrames(poseNames) {
    var resultGestureFrames = [];
    if (poseNames) {
        for (var i = 0; i < poseNames.length; i++) {
            var jsonString = PoseLibrary[poseNames[i]];
            if (jsonString != null && jsonString != undefined) {
                resultGestureFrames.push(poseFromJson(jsonString));
            } else {
                debugPrint("WARNING, No pose with name " + poseNames[i] + "found in the Pose Library");
            }
        }
    }
    return resultGestureFrames;
}

// helper functions
function debugPrint(message) {
    print("[GestureController], " + message);
}

//initialize
if (script.tapPose) {
    script.createEvent("TapEvent").bind(printPose);
}

script.api.getGestureFrames = getGestureFrames;
script.api.isMatchingPose = isMatchingPose;