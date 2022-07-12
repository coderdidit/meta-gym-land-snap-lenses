// MovementTriggerResponse.js
// Version: 0.0.1
// Event: Lens Initialized
// Description: Handles responses such as toggling objects, animating textures and running tweens from custom triggers

//@input string startTrigger
//@input string endTrigger

//@input Component.Image triggerActiveImage
//@input Component.Image triggerIdleImage

//@input SceneObject[] triggerObjects
//@input SceneObject[] triggerTweens
//@input Asset.Texture[] triggerAnimatedTextures
//@input Component.ScriptComponent[] particleBursts

//@input bool advanced
//@input string fadeInTween {"showIf":"advanced","showIfValue":"true"}
//@input string fadeOutTween {"showIf":"advanced","showIfValue":"true"}




for (var i = 0; i < script.triggerObjects.length; i++) {
    if (script.triggerObjects[i]) {
        script.triggerObjects[i].enabled = false;
    }
}

function initActiveImage() {
    if (script.triggerActiveImage) {
        var activeImage = script.triggerActiveImage;
        activeImage.enabled = false;
    }
}

initActiveImage();

function triggerImageActive() {
    if (script.triggerIdleImage) {
        var idleImage = script.triggerIdleImage;
        idleImage.enabled = false;
    }
    if (script.triggerActiveImage) {
        var activeImage = script.triggerActiveImage;
        activeImage.enabled = true;
    }
}

function triggerImageIdle() {
    if (script.triggerIdleImage) {
        var idleImage = script.triggerIdleImage;
        idleImage.enabled = true;
    }
    if (script.triggerActiveImage) {
        var activeImage = script.triggerActiveImage;
        activeImage.enabled = false;
    }
}

function OnTrigger() {
    
    triggerImageActive();
    
    for (var i = 0; i < script.triggerObjects.length; i++) {
        if (script.triggerObjects[i]) {
            script.triggerObjects[i].enabled = true;
        }
    }

    for (var j = 0; j < script.triggerTweens.length; j++) {
        if (script.triggerTweens[j]) {
            global.tweenManager.startTween(script.triggerTweens[j], script.fadeInTween);
        }
    }

    for (var k = 0; k < script.triggerAnimatedTextures.length; k++) {
        if (script.triggerAnimatedTextures[k]) {
            script.triggerAnimatedTextures[k].control.play(-1, 0);
        }
    }

    for (var l = 0; l < script.particleBursts.length; l++) {
        if (script.particleBursts[l] && script.particleBursts[l].api.stopParticles) {
            script.particleBursts[l].api.startParticles();
        }
    }
}

function OnTriggerEnd() {
    triggerImageIdle();
    if (script.triggerTweens.length > 0) {
        for (var i = 0; i < script.triggerTweens.length; i++) {
            if (script.triggerTweens[i]) {
                global.tweenManager.startTween(script.triggerTweens[i], script.fadeOutTween, OnTriggerEndTweenEnd);
            }
        }
    } else {
        OnTriggerEndTweenEnd();
    }
    
}

function OnTriggerEndTweenEnd() {
    for (var i = 0; i < script.triggerObjects.length; i++) {
        if (script.triggerObjects[i]) {
            script.triggerObjects[i].enabled = false;
        }
    }
    
    for (var j = 0; j < script.triggerAnimatedTextures.length; j++) {
        if (script.triggerAnimatedTextures[j]) {
            script.triggerAnimatedTextures[j].control.stop();
        }
    }
    
    for (var k = 0; k < script.particleBursts.length; k++) {
        if (script.particleBursts[k] && script.particleBursts[k].api.stopParticles) {
            script.particleBursts[k].api.stopParticles();
        }
    }
}

if (global.behaviorSystem) {
    global.behaviorSystem.addCustomTriggerResponse(script.startTrigger, OnTrigger);
    global.behaviorSystem.addCustomTriggerResponse(script.endTrigger, OnTriggerEnd);
} else {
    debugPrint("ERROR, Behavior system is not initialized");
}

function debugPrint(message) {
    print("[MovementTriggerResponse], " + script.getSceneObject().name + " " + message);
}