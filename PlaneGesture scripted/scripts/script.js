const Animation = require('Animation');
const Patches = require('Patches');
var Reactive = require('Reactive')
const Scene = require('Scene');
const TouchGestures = require('TouchGestures');
const Diagnostics = require('Diagnostics');

const sceneRoot = Scene.root;





Promise.all([
    sceneRoot.findFirst('FlyPlane'),
    sceneRoot.findFirst('planeTracker0'),
    sceneRoot.findFirst('placer')
])
    .then(function (objects) {
        const base = objects[0];
        const planeTracker = objects[1];
        const placer = objects[2];

        var isInititalised = false;
        var isBladeRotate = false;
        planeTracker.transform.scaleX = 0;
        planeTracker.transform.scaleY = 0;
        planeTracker.transform.scaleZ = 0;
        TouchGestures.onTap().subscribe(function (gesture) {
            Diagnostics.log('tap gesture detected');

            if (isInititalised) {
                isInititalised = false;
                planeTracker.transform.scaleX = 0;
                planeTracker.transform.scaleY = 0;
                planeTracker.transform.scaleZ = 0;
            }
            else {
                isInititalised = true;
                planeTracker.transform.scaleX = 1;
                planeTracker.transform.scaleY = 1;
                planeTracker.transform.scaleZ = 1;
                var planeTransform = planeTracker.transform;
                //update plane transform according to tap position
                planeTransform;
            }
            Patches.inputs.setBoolean("spawnLoop", isInititalised)
            Diagnostics.log("isInititalised- " + isInititalised);


        });
        TouchGestures.onPan().subscribe(function (gesture) {
            if (isInititalised) {
                Diagnostics.log('pan gesture detected');
                planeTracker.trackPoint(gesture.location, gesture.state);
            }
        });

        const placerTransform = placer.transform;

        TouchGestures.onPinch().subscribeWithSnapshot({

            'lastScaleX': placerTransform.scaleX,
            'lastScaleY': placerTransform.scaleY,
            'lastScaleZ': placerTransform.scaleZ
        }, function (gesture, snapshot) {
            if (isInititalised) {
                Diagnostics.log('pinch gesture detected');
                placerTransform.scaleX = gesture.scale.mul(snapshot.lastScaleX);
                placerTransform.scaleY = gesture.scale.mul(snapshot.lastScaleY);
                placerTransform.scaleZ = gesture.scale.mul(snapshot.lastScaleZ);
            }
        });

        TouchGestures.onRotate().subscribeWithSnapshot({
            'lastRotationY': placerTransform.rotationY,
        }, function (gesture, snapshot) {
            if (isInititalised) {
                Diagnostics.log('rotate gesture detected');

                const correctRotation = gesture.rotation.mul(-1);
                placerTransform.rotationY = correctRotation.add(snapshot.lastRotationY);
            }
        });

        TouchGestures.onLongPress().subscribe(function (gesture) {
            if (isInititalised) {
                Patches.inputs.setBoolean("RotateBlades", true);
                gesture.state.monitor().subscribe(function (state) {

                    // Return when the gesture ends
                    if (state.newValue !== 'BEGAN' && state.newValue !== 'CHANGED') {
                        Patches.inputs.setBoolean("RotateBlades", false);
                    }                
                });
            }
        });


    });