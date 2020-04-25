const Patches = require('Patches');
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
        const plane = objects[0];
        const planeTracker = objects[1];
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



        var isInititalised = false;
        var isBladeRotate = false;

        placerTransform.scaleX = 0;
        placerTransform.scaleY = 0;
        placerTransform.scaleZ = 0;

        TouchGestures.onTap().subscribe(function (gesture) {
            Diagnostics.log('tap gesture detected');

            if (isInititalised) {
                isInititalised = false;
                placerTransform.scaleX = 0;
                placerTransform.scaleY = 0;
                placerTransform.scaleZ = 0;
            }
            else {
                isInititalised = true;
                placerTransform.scaleX = 1;
                placerTransform.scaleY = 1;
                placerTransform.scaleZ = 1;
                //update plane transform according to tap position
            }
            Patches.inputs.setBoolean("spawnLoop", isInititalised);
            Diagnostics.log("isInititalised- " + isInititalised);

        });
        TouchGestures.onPan().subscribe(function (gesture) {
            if (isInititalised) {
                Diagnostics.log('pan gesture detected');
                planeTracker.trackPoint(gesture.location, gesture.state);

            }
        });
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
            Diagnostics.log('losng press gesture start');
            Diagnostics.log(isBladeRotate);
            isBladeRotate = !isBladeRotate;

            if (isInititalised) {
                Patches.inputs.setBoolean("RotateBlades", isBladeRotate);
            }
        });

    });