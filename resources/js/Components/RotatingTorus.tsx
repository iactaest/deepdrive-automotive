import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Toro wireframe rotante, pensato come sfondo decorativo dietro al logo
 * (nessuna interazione: solo auto-rotazione a velocità media).
 */
export default function RotatingTorus({ className = '' }: { className?: string }) {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, mount.clientWidth / mount.clientHeight, 0.1, 100);
        camera.position.z = 6;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        mount.appendChild(renderer.domElement);

        // Luci: calda chiave + riflessi ciano/magenta ai bordi, come nell'artefatto originale.
        // Intensita' alte perche' three.js >=0.155 usa unita' fisiche (watt) per le point light.
        scene.add(new THREE.AmbientLight(0x2a3358, 0.8));
        const key = new THREE.PointLight(0xffe9c7, 25, 30); key.position.set(5, 6, 6); scene.add(key);
        const rimC = new THREE.PointLight(0x39e6d6, 60, 30); rimC.position.set(-3, -1, 2.5); scene.add(rimC);
        const rimM = new THREE.PointLight(0xff5db1, 60, 30); rimM.position.set(3, -2.5, -1.5); scene.add(rimM);

        const geometry = new THREE.TorusGeometry(1.5, 0.5, 16, 80);
        const material = new THREE.MeshStandardMaterial({
            color: 0xaeb8ff, metalness: 0.85, roughness: 0.22,
            wireframe: true, transparent: true, opacity: 0.8,
        });
        const torus = new THREE.Mesh(geometry, material);
        scene.add(torus);

        let frameId: number;
        const speed = 0.5; // velocità media
        const animate = () => {
            frameId = requestAnimationFrame(animate);
            if (!reduceMotion) {
                torus.rotation.x += 0.002 + speed * 0.006;
                torus.rotation.y += 0.004 + speed * 0.012;
            }
            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            if (!mount) return;
            camera.aspect = mount.clientWidth / mount.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(mount.clientWidth, mount.clientHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener('resize', handleResize);
            geometry.dispose();
            material.dispose();
            renderer.dispose();
            mount.removeChild(renderer.domElement);
        };
    }, []);

    return <div ref={mountRef} className={className} aria-hidden="true" />;
}
