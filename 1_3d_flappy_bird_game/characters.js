class CharacterManager {
    constructor() {
        this.characters = {
            bird: null,   // Classic yellow bird
            crow: null,   // Black crow
            falcon: null, // Brown falcon
            seagull: null // White seagull
        };
        this.previewRenderers = {};
        this.previewScenes = {};
        this.previewCameras = {};
        this.selectedCharacter = 'bird';

        // Wait for DOM to be fully loaded before initializing previews
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initPreviews());
        } else {
            // DOM already loaded, initialize immediately
            setTimeout(() => this.initPreviews(), 100);
        }
    }

    initPreviews() {
        const previewContainers = [
            'bird-preview',
            'crow-preview',
            'falcon-preview',
            'seagull-preview'
        ];

        previewContainers.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (!container) {
                console.error(`Container #${containerId} not found`);
                return;
            }

            const characterType = containerId.split('-')[0];

            // Create scene
            const scene = new THREE.Scene();
            scene.background = new THREE.Color(0x333333);

            // Create camera
            const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
            camera.position.z = 3;

            // Create renderer
            const renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(120, 120); // Fixed size for preview
            container.appendChild(renderer.domElement);

            // Add light
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
            scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(0, 1, 1);
            scene.add(directionalLight);

            // Create character model
            this.createCharacterModel(characterType, scene);

            // Store references
            this.previewScenes[characterType] = scene;
            this.previewCameras[characterType] = camera;
            this.previewRenderers[characterType] = renderer;

            // Start animation
            this.animatePreview(characterType);
        });
    }

    createCharacterModel(type, scene) {
        let model;

        switch (type) {
            case 'bird':
                // Classic yellow bird
                const birdGeometry = new THREE.BoxGeometry(1, 1, 1);
                const birdMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFF00 });
                model = new THREE.Mesh(birdGeometry, birdMaterial);

                // Add wings
                const wingGeometry = new THREE.BoxGeometry(0.2, 0.1, 0.6);
                const wingMaterial = new THREE.MeshPhongMaterial({ color: 0xFFCC00 });

                const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
                leftWing.position.set(0, 0, -0.6);
                model.add(leftWing);

                const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
                rightWing.position.set(0, 0, 0.6);
                model.add(rightWing);

                // Add beak
                const beakGeometry = new THREE.ConeGeometry(0.2, 0.5, 8);
                const beakMaterial = new THREE.MeshPhongMaterial({ color: 0xFF6600 });
                const beak = new THREE.Mesh(beakGeometry, beakMaterial);
                beak.position.set(0.7, 0, 0);
                beak.rotation.z = -Math.PI / 2;
                model.add(beak);

                // Add eyes
                const eyeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
                const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });

                const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
                leftEye.position.set(0.3, 0.3, 0.4);
                model.add(leftEye);

                const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
                rightEye.position.set(0.3, 0.3, -0.4);
                model.add(rightEye);
                break;

            case 'crow':
                // Black crow
                const crowGeometry = new THREE.BoxGeometry(1.2, 0.9, 1);
                const crowMaterial = new THREE.MeshPhongMaterial({
                    color: 0x222222,
                    shininess: 30
                });
                model = new THREE.Mesh(crowGeometry, crowMaterial);

                // Add wings
                const crowWingGeometry = new THREE.BoxGeometry(0.3, 0.1, 0.8);
                const crowWingMaterial = new THREE.MeshPhongMaterial({
                    color: 0x333333,
                    shininess: 20
                });

                const crowLeftWing = new THREE.Mesh(crowWingGeometry, crowWingMaterial);
                crowLeftWing.position.set(0, 0, -0.6);
                model.add(crowLeftWing);

                const crowRightWing = new THREE.Mesh(crowWingGeometry, crowWingMaterial);
                crowRightWing.position.set(0, 0, 0.6);
                model.add(crowRightWing);

                // Add beak
                const crowBeakGeometry = new THREE.ConeGeometry(0.15, 0.6, 8);
                const crowBeakMaterial = new THREE.MeshPhongMaterial({ color: 0x111111 });
                const crowBeak = new THREE.Mesh(crowBeakGeometry, crowBeakMaterial);
                crowBeak.position.set(0.8, 0, 0);
                crowBeak.rotation.z = -Math.PI / 2;
                model.add(crowBeak);

                // Add eyes
                const crowEyeGeometry = new THREE.SphereGeometry(0.08, 8, 8);
                const crowEyeMaterial = new THREE.MeshPhongMaterial({
                    color: 0xFFFFFF,
                    emissive: 0x444444,
                    emissiveIntensity: 0.5
                });

                const crowLeftEye = new THREE.Mesh(crowEyeGeometry, crowEyeMaterial);
                crowLeftEye.position.set(0.4, 0.3, 0.3);
                model.add(crowLeftEye);

                const crowRightEye = new THREE.Mesh(crowEyeGeometry, crowEyeMaterial);
                crowRightEye.position.set(0.4, 0.3, -0.3);
                model.add(crowRightEye);

                // Add tail feathers
                const tailGeometry = new THREE.BoxGeometry(0.4, 0.1, 0.6);
                const tailMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
                const tail = new THREE.Mesh(tailGeometry, tailMaterial);
                tail.position.set(-0.7, 0, 0);
                tail.rotation.y = Math.PI / 4;
                model.add(tail);
                break;

            case 'falcon':
                // Brown falcon
                const falconGeometry = new THREE.BoxGeometry(1.1, 0.8, 0.9);
                const falconMaterial = new THREE.MeshPhongMaterial({
                    color: 0x8B4513, // Brown
                    shininess: 30
                });
                model = new THREE.Mesh(falconGeometry, falconMaterial);

                // Add wings
                const falconWingGeometry = new THREE.BoxGeometry(0.4, 0.1, 1.0);
                const falconWingMaterial = new THREE.MeshPhongMaterial({
                    color: 0x654321, // Darker brown
                    shininess: 20
                });

                const falconLeftWing = new THREE.Mesh(falconWingGeometry, falconWingMaterial);
                falconLeftWing.position.set(0, 0, -0.7);
                model.add(falconLeftWing);

                const falconRightWing = new THREE.Mesh(falconWingGeometry, falconWingMaterial);
                falconRightWing.position.set(0, 0, 0.7);
                model.add(falconRightWing);

                // Add beak
                const falconBeakGeometry = new THREE.ConeGeometry(0.12, 0.5, 8);
                const falconBeakMaterial = new THREE.MeshPhongMaterial({ color: 0xFFCC00 }); // Yellow beak
                const falconBeak = new THREE.Mesh(falconBeakGeometry, falconBeakMaterial);
                falconBeak.position.set(0.7, 0, 0);
                falconBeak.rotation.z = -Math.PI / 2;
                model.add(falconBeak);

                // Add eyes
                const falconEyeGeometry = new THREE.SphereGeometry(0.08, 8, 8);
                const falconEyeMaterial = new THREE.MeshPhongMaterial({
                    color: 0x000000,
                    emissive: 0x222222,
                    emissiveIntensity: 0.5
                });

                const falconLeftEye = new THREE.Mesh(falconEyeGeometry, falconEyeMaterial);
                falconLeftEye.position.set(0.4, 0.25, 0.3);
                model.add(falconLeftEye);

                const falconRightEye = new THREE.Mesh(falconEyeGeometry, falconEyeMaterial);
                falconRightEye.position.set(0.4, 0.25, -0.3);
                model.add(falconRightEye);

                // Add head crest
                const crestGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.4);
                const crestMaterial = new THREE.MeshPhongMaterial({ color: 0x654321 });
                const crest = new THREE.Mesh(crestGeometry, crestMaterial);
                crest.position.set(0.3, 0.5, 0);
                model.add(crest);
                break;

            case 'seagull':
                // White seagull
                const seagullGeometry = new THREE.BoxGeometry(1, 0.8, 1.1);
                const seagullMaterial = new THREE.MeshPhongMaterial({
                    color: 0xFFFFFF,
                    shininess: 50
                });
                model = new THREE.Mesh(seagullGeometry, seagullMaterial);

                // Add wings
                const seagullWingGeometry = new THREE.BoxGeometry(0.4, 0.1, 1.2);
                const seagullWingMaterial = new THREE.MeshPhongMaterial({
                    color: 0xEEEEEE,
                    shininess: 40
                });

                const seagullLeftWing = new THREE.Mesh(seagullWingGeometry, seagullWingMaterial);
                seagullLeftWing.position.set(0, 0, -0.8);
                model.add(seagullLeftWing);

                const seagullRightWing = new THREE.Mesh(seagullWingGeometry, seagullWingMaterial);
                seagullRightWing.position.set(0, 0, 0.8);
                model.add(seagullRightWing);

                // Add beak
                const seagullBeakGeometry = new THREE.ConeGeometry(0.15, 0.6, 8);
                const seagullBeakMaterial = new THREE.MeshPhongMaterial({ color: 0xFFA500 }); // Orange beak
                const seagullBeak = new THREE.Mesh(seagullBeakGeometry, seagullBeakMaterial);
                seagullBeak.position.set(0.7, 0, 0);
                seagullBeak.rotation.z = -Math.PI / 2;
                model.add(seagullBeak);

                // Add eyes
                const seagullEyeGeometry = new THREE.SphereGeometry(0.08, 8, 8);
                const seagullEyeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });

                const seagullLeftEye = new THREE.Mesh(seagullEyeGeometry, seagullEyeMaterial);
                seagullLeftEye.position.set(0.4, 0.3, 0.3);
                model.add(seagullLeftEye);

                const seagullRightEye = new THREE.Mesh(seagullEyeGeometry, seagullEyeMaterial);
                seagullRightEye.position.set(0.4, 0.3, -0.3);
                model.add(seagullRightEye);

                // Add gray wing tips
                const wingTipGeometry = new THREE.BoxGeometry(0.2, 0.1, 0.3);
                const wingTipMaterial = new THREE.MeshPhongMaterial({ color: 0xAAAAAA });

                const leftWingTip = new THREE.Mesh(wingTipGeometry, wingTipMaterial);
                leftWingTip.position.set(0, 0, -1.3);
                model.add(leftWingTip);

                const rightWingTip = new THREE.Mesh(wingTipGeometry, wingTipMaterial);
                rightWingTip.position.set(0, 0, 1.3);
                model.add(rightWingTip);
                break;
        }

        scene.add(model);
        this.characters[type] = model;
        return model;
    }

    animatePreview(type) {
        const scene = this.previewScenes[type];
        const camera = this.previewCameras[type];
        const renderer = this.previewRenderers[type];
        const model = this.characters[type];

        const animate = () => {
            requestAnimationFrame(animate);

            // Rotate the model for preview
            if (model) {
                model.rotation.y += 0.01;
            }

            renderer.render(scene, camera);
        };

        animate();
    }

    getCharacterModel(type) {
        // Create a new instance of the selected character model
        const scene = new THREE.Scene();
        const model = this.createCharacterModel(type, scene);
        scene.remove(model); // Remove from temporary scene
        return model.clone();
    }

    setSelectedCharacter(type) {
        this.selectedCharacter = type;

        // Update UI to show selection
        document.querySelectorAll('.character-option').forEach(option => {
            if (option.dataset.character === type) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
    }

    getSelectedCharacter() {
        return this.selectedCharacter;
    }
} 