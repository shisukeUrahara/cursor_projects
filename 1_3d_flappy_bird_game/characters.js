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
                // Classic yellow bird - cubical style
                const birdGroup = new THREE.Group();

                // Main body - cube
                const bodyGeometry = new THREE.BoxGeometry(1, 1, 1);
                const bodyMaterial = new THREE.MeshPhongMaterial({
                    color: 0xFFFF00, // Bright yellow
                    shininess: 30
                });
                const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
                birdGroup.add(body);

                // Wings - simple blocks
                const wingGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.7);
                const wingMaterial = new THREE.MeshPhongMaterial({
                    color: 0xFFCC00, // Slightly darker yellow
                    shininess: 20
                });

                const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
                leftWing.position.set(0, 0, -0.6);
                leftWing.name = "leftWing";
                birdGroup.add(leftWing);

                const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
                rightWing.position.set(0, 0, 0.6);
                rightWing.name = "rightWing";
                birdGroup.add(rightWing);

                // Beak - simple triangle
                const beakGeometry = new THREE.ConeGeometry(0.2, 0.5, 4);
                const beakMaterial = new THREE.MeshPhongMaterial({
                    color: 0xFF6600, // Orange
                    shininess: 50
                });
                const beak = new THREE.Mesh(beakGeometry, beakMaterial);
                beak.position.set(0.7, 0, 0);
                beak.rotation.z = -Math.PI / 2;
                birdGroup.add(beak);

                // Eyes - simple spheres
                const eyeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
                const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });

                const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
                leftEye.position.set(0.4, 0.3, 0.3);
                birdGroup.add(leftEye);

                const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
                rightEye.position.set(0.4, 0.3, -0.3);
                birdGroup.add(rightEye);

                model = birdGroup;
                break;

            case 'crow':
                // Black crow - cubical style
                const crowGroup = new THREE.Group();

                // Main body - slightly longer cube
                const crowBodyGeometry = new THREE.BoxGeometry(1.2, 0.9, 1);
                const crowBodyMaterial = new THREE.MeshPhongMaterial({
                    color: 0x222222, // Dark black
                    shininess: 10
                });
                const crowBody = new THREE.Mesh(crowBodyGeometry, crowBodyMaterial);
                crowGroup.add(crowBody);

                // Wings - simple blocks
                const crowWingGeometry = new THREE.BoxGeometry(0.4, 0.2, 0.8);
                const crowWingMaterial = new THREE.MeshPhongMaterial({
                    color: 0x333333, // Slightly lighter black
                    shininess: 5
                });

                const crowLeftWing = new THREE.Mesh(crowWingGeometry, crowWingMaterial);
                crowLeftWing.position.set(0, 0, -0.6);
                crowLeftWing.name = "leftWing";
                crowGroup.add(crowLeftWing);

                const crowRightWing = new THREE.Mesh(crowWingGeometry, crowWingMaterial);
                crowRightWing.position.set(0, 0, 0.6);
                crowRightWing.name = "rightWing";
                crowGroup.add(crowRightWing);

                // Beak - sharper cone
                const crowBeakGeometry = new THREE.ConeGeometry(0.15, 0.6, 4);
                const crowBeakMaterial = new THREE.MeshPhongMaterial({
                    color: 0x111111, // Very dark gray
                    shininess: 30
                });
                const crowBeak = new THREE.Mesh(crowBeakGeometry, crowBeakMaterial);
                crowBeak.position.set(0.8, 0, 0);
                crowBeak.rotation.z = -Math.PI / 2;
                crowGroup.add(crowBeak);

                // Eyes - simple spheres with gray color
                const crowEyeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
                const crowEyeMaterial = new THREE.MeshPhongMaterial({
                    color: 0xCCCCCC, // Light gray
                    shininess: 80
                });

                const crowLeftEye = new THREE.Mesh(crowEyeGeometry, crowEyeMaterial);
                crowLeftEye.position.set(0.5, 0.3, 0.3);
                crowGroup.add(crowLeftEye);

                const crowRightEye = new THREE.Mesh(crowEyeGeometry, crowEyeMaterial);
                crowRightEye.position.set(0.5, 0.3, -0.3);
                crowGroup.add(crowRightEye);

                // Tail - simple block
                const crowTailGeometry = new THREE.BoxGeometry(0.5, 0.2, 0.6);
                const crowTailMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
                const crowTail = new THREE.Mesh(crowTailGeometry, crowTailMaterial);
                crowTail.position.set(-0.7, 0, 0);
                crowGroup.add(crowTail);

                model = crowGroup;
                break;

            case 'falcon':
                // Brown falcon - cubical style
                const falconGroup = new THREE.Group();

                // Main body - streamlined cube
                const falconBodyGeometry = new THREE.BoxGeometry(1.1, 0.8, 0.9);
                const falconBodyMaterial = new THREE.MeshPhongMaterial({
                    color: 0x8B4513, // Saddle brown
                    shininess: 30
                });
                const falconBody = new THREE.Mesh(falconBodyGeometry, falconBodyMaterial);
                falconGroup.add(falconBody);

                // Wings - longer blocks
                const falconWingGeometry = new THREE.BoxGeometry(0.5, 0.2, 1.0);
                const falconWingMaterial = new THREE.MeshPhongMaterial({
                    color: 0x654321, // Darker brown
                    shininess: 20
                });

                const falconLeftWing = new THREE.Mesh(falconWingGeometry, falconWingMaterial);
                falconLeftWing.position.set(0, 0, -0.7);
                falconLeftWing.name = "leftWing";
                falconGroup.add(falconLeftWing);

                const falconRightWing = new THREE.Mesh(falconWingGeometry, falconWingMaterial);
                falconRightWing.position.set(0, 0, 0.7);
                falconRightWing.name = "rightWing";
                falconGroup.add(falconRightWing);

                // Beak - hooked cone
                const falconBeakGeometry = new THREE.ConeGeometry(0.15, 0.5, 4);
                const falconBeakMaterial = new THREE.MeshPhongMaterial({
                    color: 0x111111, // Dark beak
                    shininess: 50
                });
                const falconBeak = new THREE.Mesh(falconBeakGeometry, falconBeakMaterial);
                falconBeak.position.set(0.7, 0, 0);
                falconBeak.rotation.z = -Math.PI / 2;
                falconGroup.add(falconBeak);

                // Eyes - simple spheres with yellow color
                const falconEyeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
                const falconEyeMaterial = new THREE.MeshPhongMaterial({
                    color: 0xFFD700, // Gold
                    shininess: 100
                });

                const falconLeftEye = new THREE.Mesh(falconEyeGeometry, falconEyeMaterial);
                falconLeftEye.position.set(0.5, 0.25, 0.3);
                falconGroup.add(falconLeftEye);

                const falconRightEye = new THREE.Mesh(falconEyeGeometry, falconEyeMaterial);
                falconRightEye.position.set(0.5, 0.25, -0.3);
                falconGroup.add(falconRightEye);

                // Head crest - simple block
                const crestGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.4);
                const crestMaterial = new THREE.MeshPhongMaterial({ color: 0x654321 });
                const crest = new THREE.Mesh(crestGeometry, crestMaterial);
                crest.position.set(0.3, 0.5, 0);
                falconGroup.add(crest);

                model = falconGroup;
                break;

            case 'seagull':
                // White seagull - cubical style
                const seagullGroup = new THREE.Group();

                // Main body - slightly wider cube
                const seagullBodyGeometry = new THREE.BoxGeometry(1, 0.8, 1.1);
                const seagullBodyMaterial = new THREE.MeshPhongMaterial({
                    color: 0xFFFFFF, // White
                    shininess: 50
                });
                const seagullBody = new THREE.Mesh(seagullBodyGeometry, seagullBodyMaterial);
                seagullGroup.add(seagullBody);

                // Wings - wide blocks
                const seagullWingGeometry = new THREE.BoxGeometry(0.4, 0.2, 1.2);
                const seagullWingMaterial = new THREE.MeshPhongMaterial({
                    color: 0xEEEEEE, // Slightly off-white
                    shininess: 40
                });

                const seagullLeftWing = new THREE.Mesh(seagullWingGeometry, seagullWingMaterial);
                seagullLeftWing.position.set(0, 0, -0.8);
                seagullLeftWing.name = "leftWing";
                seagullGroup.add(seagullLeftWing);

                const seagullRightWing = new THREE.Mesh(seagullWingGeometry, seagullWingMaterial);
                seagullRightWing.position.set(0, 0, 0.8);
                seagullRightWing.name = "rightWing";
                seagullGroup.add(seagullRightWing);

                // Beak - orange cone
                const seagullBeakGeometry = new THREE.ConeGeometry(0.15, 0.6, 4);
                const seagullBeakMaterial = new THREE.MeshPhongMaterial({
                    color: 0xFFA500, // Orange
                    shininess: 50
                });
                const seagullBeak = new THREE.Mesh(seagullBeakGeometry, seagullBeakMaterial);
                seagullBeak.position.set(0.7, 0, 0);
                seagullBeak.rotation.z = -Math.PI / 2;
                seagullGroup.add(seagullBeak);

                // Eyes - simple black spheres
                const seagullEyeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
                const seagullEyeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });

                const seagullLeftEye = new THREE.Mesh(seagullEyeGeometry, seagullEyeMaterial);
                seagullLeftEye.position.set(0.5, 0.3, 0.3);
                seagullGroup.add(seagullLeftEye);

                const seagullRightEye = new THREE.Mesh(seagullEyeGeometry, seagullEyeMaterial);
                seagullRightEye.position.set(0.5, 0.3, -0.3);
                seagullGroup.add(seagullRightEye);

                // Gray wing tips - characteristic of seagulls
                const wingTipGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.3);
                const wingTipMaterial = new THREE.MeshPhongMaterial({ color: 0xAAAAAA });

                const leftWingTip = new THREE.Mesh(wingTipGeometry, wingTipMaterial);
                leftWingTip.position.set(0, 0, -1.3);
                seagullGroup.add(leftWingTip);

                const rightWingTip = new THREE.Mesh(wingTipGeometry, wingTipMaterial);
                rightWingTip.position.set(0, 0, 1.3);
                seagullGroup.add(rightWingTip);

                model = seagullGroup;
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

        let time = 0;

        const animate = () => {
            requestAnimationFrame(animate);
            time += 0.03;

            // Simple rotation for preview
            if (model) {
                model.rotation.y += 0.01;

                // Simple wing flapping animation
                model.children.forEach(child => {
                    if (child.name === "leftWing") {
                        child.rotation.x = Math.sin(time * 3) * 0.2;
                    } else if (child.name === "rightWing") {
                        child.rotation.x = Math.sin(time * 3) * 0.2;
                    }
                });
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