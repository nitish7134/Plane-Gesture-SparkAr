const Patches = require('Patches');
const Scene = require('Scene');
const Instruction = require('Instruction');
const TouchGestures = require('TouchGestures');
const Diagnostics = require('Diagnostics');


const sceneRoot = Scene.root;

const isBackCam = Patches.getBooleanValue("BackCamera");
const isFace = Patches.getBooleanValue("FaceTrackerBool");

var isInititalised = false;
var isBladeRotate = false;


Promise.all([
        sceneRoot.findFirst('planeTracker0'),
        sceneRoot.findFirst('InstructionText'),
        sceneRoot.findFirst('placer')
    ])
    .then(function(objects) {
        const planeTracker = objects[0];
        const instructext = objects[1];
        const placer = objects[2];
        const placerTransform = placer.transform;


        /*    const planeAnimParam = {
               durationMilliseconds: 400,
               loopCount: 0,
               mirror: false
           };
           const planeAnimDriver = Animation.timeDriver(planeAnimParam);
           planeAnimDriver.start();
           const planeAnimRotationSampler = Animation.samplers.easeInQuint(-90, 990);
           const planeAnimScaleSampler = Animation.samplers.easeInQuint(0, 1);
           const planeAnimRotation = Animation.animate(planeAnimParam, planeAnimRotationSampler);
           const planeAnimScale = Animation.animate(planeAnimParam, planeAnimScaleSampler);
           const planeTransform = plane.transform;
           planeTransform.scaleX = planeAnimScale;
           planeTransform.scaleY = planeAnimScale;
           planeTransform.scaleZ = planeAnimScale;
           planeTransform.rotationY = planeAnimRotation; */

        placerTransform.scaleX = 0;
        placerTransform.scaleY = 0;
        placerTransform.scaleZ = 0;
        instructext.text = "Tap To Place";
        TouchGestures.onTap().subscribe(function(gesture) {
            Diagnostics.log('tap gesture detected');
            Diagnostics.log(isBackCam.pinLastValue() + "isFace: " + isFace.pinLastValue());
            if (isBackCam.pinLastValue()) {

                if (isInititalised) {
                    if (!isFace.pinLastValue())
                        instructext.text = "Tap To Place";
                    isInititalised = false;
                    placerTransform.scaleX = 0;
                    placerTransform.scaleY = 0;
                    placerTransform.scaleZ = 0;
                } else {
                    if (!isFace.pinLastValue()) {
                        instructext.text = "";
                        isInititalised = true;
                        placerTransform.scaleX = 1;
                        placerTransform.scaleY = 1;
                        placerTransform.scaleZ = 1;
                    }
                }
                Patches.inputs.setBoolean("spawnLoop", isInititalised);
                Diagnostics.log("isInititalised- " + isInititalised);
            }
        });
        TouchGestures.onPan().subscribe(function(gesture) {


            if (isBackCam.pinLastValue() && isInititalised && isFace.pinLastValue()) {
                Diagnostics.log('pan gesture detected');
                planeTracker.trackPoint(gesture.location, gesture.state);
            }
        });
        TouchGestures.onPinch().subscribeWithSnapshot({

            'lastScaleX': placerTransform.scaleX,
            'lastScaleY': placerTransform.scaleY,
            'lastScaleZ': placerTransform.scaleZ
        }, function(gesture, snapshot) {

            if (isBackCam.pinLastValue() && isInititalised && isFace.pinLastValue()) {
                Diagnostics.log('pinch gesture detected');
                placerTransform.scaleX = gesture.scale.mul(snapshot.lastScaleX);
                placerTransform.scaleY = gesture.scale.mul(snapshot.lastScaleY);
                placerTransform.scaleZ = gesture.scale.mul(snapshot.lastScaleZ);
            }
        });

        TouchGestures.onRotate().subscribeWithSnapshot({
            'lastRotationY': placerTransform.rotationY,
        }, function(gesture, snapshot) {
            if (isBackCam.pinLastValue() && isInititalised && isFace.pinLastValue()) {

                const correctRotation = gesture.rotation.mul(-1);
                placerTransform.rotationY = correctRotation.add(snapshot.lastRotationY);
            }
        });

        TouchGestures.onLongPress().subscribe(function(gesture) {
            Diagnostics.log('lonasfa ' + isBladeRotate + "dfdf:" + isBackCam + ":::" + isInititalised);

            if (isBackCam.pinLastValue() && isInititalised && isFace.pinLastValue()) {
                isBladeRotate = !isBladeRotate;
                Diagnostics.log('long press gesture start: ' + isBladeRotate);
                Patches.inputs.setBoolean("RotateBlades", isBladeRotate);
            }
        });

    });