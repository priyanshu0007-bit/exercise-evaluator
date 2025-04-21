import React, { useEffect, useRef } from 'react';
import { Pose } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import * as THREE from 'three';

const PoseDetection = ({ exerciseType }) => {
  const videoRef = useRef(null);
  const mountRef = useRef(null);
  let scene, camera3D, renderer, keypointMeshes = [];

  useEffect(() => {
    setupThreeJS(); // ⬅️ Initialize Three.js scene

    const pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.3/${file}`
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults(onResults);

    const videoElement = videoRef.current;
    const cam = new Camera(videoElement, {
      onFrame: async () => await pose.send({ image: videoElement }),
      width: 640,
      height: 480,
    });
    cam.start();

    return () => {
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  const setupThreeJS = () => {
    scene = new THREE.Scene();
    camera3D = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const light = new THREE.AmbientLight(0xffffff);
    scene.add(light);
    camera3D.position.z = 5;

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera3D);
    };
    animate();
  };

  const onResults = (results) => {
    const landmarks = results.poseLandmarks;
    if (!landmarks) return;

    // Clear old meshes
    keypointMeshes.forEach(mesh => scene.remove(mesh));
    keypointMeshes = [];

    // Loop through landmarks
    landmarks.forEach((landmark, index) => {
      const x = (landmark.x - 0.5) * 5; // Center in view
      const y = -(landmark.y - 0.5) * 5;
      const z = -landmark.z * 5;

      const isCorrect = evaluatePosture(landmark, index); // Check posture
      const color = isCorrect ? 0x00ff00 : 0xff0000;
      const material = new THREE.MeshBasicMaterial({ color });
      const geometry = new THREE.SphereGeometry(0.05, 16, 16);
      const mesh = new THREE.Mesh(geometry, material);

      mesh.position.set(x, y, z);
      scene.add(mesh);
      keypointMeshes.push(mesh);
    });
  };

  const evaluatePosture = (landmark, index) => {
    // Dummy logic: Mark hips (index 23/24) as bad, rest as good
    if (exerciseType === 'squats' && (index === 23 || index === 24)) return false;
    if (exerciseType === 'push-ups' && index === 12) return false;
    return true;
  };

  return (
    <>
      <video ref={videoRef} className="hidden-video" autoPlay playsInline muted />
      <div className="canvas-container" ref={mountRef} />
    </>
  );

};

export default PoseDetection;
