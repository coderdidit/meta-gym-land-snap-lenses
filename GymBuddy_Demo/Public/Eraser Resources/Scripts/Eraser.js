// -----JS CODE-----
//@input Asset.Texture inputTexture
//@input Asset.Texture maskTexture
//@input Component.PostEffectVisual finalPass
//@input int cameraRenderOrder
//@input float edgesMix {"widget":"slider", "min":0.0, "max":1.0, "step":0.001}

//@input bool MaterialSetup
//@input Asset.Material downSample {"showIf":"MaterialSetup","hint":"material for merge and downsample"}
//@input Asset.Material step2 {"showIf":"MaterialSetup","hint":"contraction"}
//@input Asset.Material eraseall {"showIf":"MaterialSetup","hint":"erase all mask"}
//@input Asset.Material composition8Mat {"showIf":"MaterialSetup","hint":"layers composition"}

var procSizeX = 256;
var procSizeY = 512;
function createPost(material, layer) {
    var meshSceneObj = scene.createSceneObject("")
    meshSceneObj.layer = layer
    var mesh = meshSceneObj.createComponent("PostEffectVisual");
    mesh.mainMaterial = material
    return meshSceneObj;
}

var camRenderOrder = script.cameraRenderOrder
function createPass(material, sizeX, sizeY) {
    var objRoot = scene.createSceneObject("");
    var newCamera = objRoot.createComponent('Camera');
    var layer = LayerSet.makeUnique();
    newCamera.renderLayer = layer;
    newCamera.renderOrder = camRenderOrder
    camRenderOrder+=1
    var camSprite = createPost(material, layer)
    
    var generateTextureOutput = scene.createRenderTargetTexture();
    generateTextureOutput.control.inputTexture = script.inputTexture;
    var useScreenRes = (sizeX <= 0 || sizeY <= 0) ? true : false
    generateTextureOutput.control.useScreenResolution = useScreenRes
    if (!useScreenRes) {
        generateTextureOutput.control.resolution = new vec2(sizeX, sizeY)
    }
    newCamera.renderTarget = generateTextureOutput

    return generateTextureOutput;
}

function createErasePass(mat, inputTex, sizeX, sizeY) {
    mat.mainPass.baseTex = inputTex
    var target = createPass(mat, sizeX, sizeY)
    target.control.clearColorOption = ClearColorOption.None
    return target
}

// initial buffer merging with mask
var downSamplePass = createPass(script.downSample, 2*procSizeX, 2*procSizeY)
script.downSample.mainPass.baseTex = script.inputTexture
script.downSample.mainPass.maskTex = script.maskTexture

//
var renderTexture = [];
renderTexture[0] = createErasePass(script.step2, downSamplePass, procSizeX, procSizeY)
renderTexture[1] = createErasePass(script.step2.clone(), renderTexture[0], procSizeX/2, procSizeY/2)
renderTexture[2] = createErasePass(script.step2.clone(), renderTexture[1], procSizeX/4, procSizeY/4)
renderTexture[3] = createErasePass(script.step2.clone(), renderTexture[2], procSizeX/8, procSizeY/8)
renderTexture[4] = createErasePass(script.eraseall, renderTexture[3], procSizeX/16, procSizeY/16)

var compositiomMat = script.composition8Mat;
compositiomMat.mainPass.baseTex0 = renderTexture[0]
compositiomMat.mainPass.baseTex1 = renderTexture[1]
compositiomMat.mainPass.baseTex2 = renderTexture[2]
compositiomMat.mainPass.baseTex3 = renderTexture[3]
compositiomMat.mainPass.baseTex4 = renderTexture[4]
compositiomMat.mainPass.useTexCount = script.NumberOfContraction;
compositiomMat.mainPass.maskTex = script.maskTexture
compositiomMat.mainPass.edgesMix = script.edgesMix

var compositionPass = createPass(compositiomMat, procSizeX, procSizeY)


script.finalPass.mainMaterial.mainPass.baseTex = script.inputTexture
script.finalPass.mainMaterial.mainPass.blurInputTexture = compositionPass
script.finalPass.mainMaterial.mainPass.maskInputTexture = script.maskTexture

//------------------------upd-----------------------------------
var updEvent = script.createEvent("UpdateEvent")
function firstFrame(eventData) {
    if (typeof set !== "undefined") {
        updEvent.enabled = false;
        compositionPass.control.clearColorOption = ClearColorOption.None;
        //print("cleared")
    }
    set = true;
}

updEvent.bind(firstFrame)
