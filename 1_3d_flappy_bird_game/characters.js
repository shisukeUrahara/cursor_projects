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
                // Classic yellow bird - more rounded and anatomically correct
                const birdBody = new THREE.Group();

                // Main body - use ellipsoid shape instead of box
                const bodyGeometry = new THREE.SphereGeometry(0.6, 16, 12);
                const bodyMaterial = new THREE.MeshPhongMaterial({
                    color: 0xFFFF00,
                    shininess: 30
                });
                const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
                body.scale.set(1, 0.8, 0.9);
                birdBody.add(body);

                // Head - slightly smaller sphere
                const headGeometry = new THREE.SphereGeometry(0.4, 16, 12);
                const headMaterial = new THREE.MeshPhongMaterial({
                    color: 0xFFFF00,
                    shininess: 30
                });
                const head = new THREE.Mesh(headGeometry, headMaterial);
                head.position.set(0.5, 0.2, 0);
                birdBody.add(head);

                // Wings - curved shape
                const wingShape = new THREE.Shape();
                wingShape.moveTo(0, 0);
                wingShape.quadraticCurveTo(0.3, 0.2, 0.6, 0);
                wingShape.quadraticCurveTo(0.3, -0.3, 0, 0);

                const wingGeometry = new THREE.ShapeGeometry(wingShape);
                const wingMaterial = new THREE.MeshPhongMaterial({
                    color: 0xFFCC00,
                    side: THREE.DoubleSide,
                    shininess: 30
                });

                const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
                leftWing.rotation.y = Math.PI / 2;
                leftWing.position.set(0, 0, -0.6);
                birdBody.add(leftWing);

                const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
                rightWing.rotation.y = -Math.PI / 2;
                rightWing.position.set(0, 0, 0.6);
                birdBody.add(rightWing);

                // Beak - more triangular
                const beakGeometry = new THREE.ConeGeometry(0.15, 0.4, 4);
                const beakMaterial = new THREE.MeshPhongMaterial({
                    color: 0xFF6600,
                    shininess: 50
                });
                const beak = new THREE.Mesh(beakGeometry, beakMaterial);
                beak.position.set(0.9, 0.2, 0);
                beak.rotation.z = -Math.PI / 2;
                birdBody.add(beak);

                // Eyes
                const eyeGeometry = new THREE.SphereGeometry(0.08, 8, 8);
                const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });

                const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
                leftEye.position.set(0.7, 0.3, 0.2);
                birdBody.add(leftEye);

                const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
                rightEye.position.set(0.7, 0.3, -0.2);
                birdBody.add(rightEye);

                // Tail feathers
                const tailGeometry = new THREE.BoxGeometry(0.4, 0.1, 0.5);
                tailGeometry.translate(-0.2, 0, 0);
                const tailMaterial = new THREE.MeshPhongMaterial({ color: 0xFFCC00 });
                const tail = new THREE.Mesh(tailGeometry, tailMaterial);
                tail.position.set(-0.6, 0, 0);
                birdBody.add(tail);

                model = birdBody;
                break;

            case 'crow':
                // Black crow with more realistic features
                const crowBody = new THREE.Group();

                // Main body - sleeker shape
                const crowBodyGeometry = new THREE.SphereGeometry(0.6, 16, 12);
                const crowBodyMaterial = new THREE.MeshPhongMaterial({
                    color: 0x222222,
                    shininess: 5 // Less shiny for feather-like appearance
                });
                const crowBodyMesh = new THREE.Mesh(crowBodyGeometry, crowBodyMaterial);
                crowBodyMesh.scale.set(1.1, 0.7, 0.8);
                crowBody.add(crowBodyMesh);

                // Head - slightly more angular
                const crowHeadGeometry = new THREE.SphereGeometry(0.45, 16, 12);
                const crowHeadMaterial = new THREE.MeshPhongMaterial({
                    color: 0x222222,
                    shininess: 5
                });
                const crowHead = new THREE.Mesh(crowHeadGeometry, crowHeadMaterial);
                crowHead.scale.set(0.9, 0.9, 0.8);
                crowHead.position.set(0.5, 0.25, 0);
                crowBody.add(crowHead);

                // Beak - sharper and more pointed
                const crowBeakGeometry = new THREE.ConeGeometry(0.1, 0.5, 4);
                const crowBeakMaterial = new THREE.MeshPhongMaterial({
                    color: 0x111111,
                    shininess: 30
                });
                const crowBeak = new THREE.Mesh(crowBeakGeometry, crowBeakMaterial);
                crowBeak.position.set(0.95, 0.2, 0);
                crowBeak.rotation.z = -Math.PI / 2;
                crowBody.add(crowBeak);

                // Wings - larger for crow
                const crowWingGeometry = new THREE.BoxGeometry(0.8, 0.1, 1.2);
                crowWingGeometry.translate(-0.2, 0, 0);
                const crowWingMaterial = new THREE.MeshPhongMaterial({
                    color: 0x222222,
                    shininess: 5
                });

                const crowLeftWing = new THREE.Mesh(crowWingGeometry, crowWingMaterial);
                crowLeftWing.position.set(0, 0, -0.6);
                crowBody.add(crowLeftWing);

                const crowRightWing = new THREE.Mesh(crowWingGeometry, crowWingMaterial);
                crowRightWing.position.set(0, 0, 0.6);
                crowBody.add(crowRightWing);

                // Eyes - piercing
                const crowEyeGeometry = new THREE.SphereGeometry(0.07, 8, 8);
                const crowEyeMaterial = new THREE.MeshPhongMaterial({
                    color: 0xCCCCCC, // Light gray eyes
                    shininess: 80
                });

                const crowLeftEye = new THREE.Mesh(crowEyeGeometry, crowEyeMaterial);
                crowLeftEye.position.set(0.7, 0.35, 0.2);
                crowBody.add(crowLeftEye);

                const crowRightEye = new THREE.Mesh(crowEyeGeometry, crowEyeMaterial);
                crowRightEye.position.set(0.7, 0.35, -0.2);
                crowBody.add(crowRightEye);

                // Tail - fan-shaped
                const crowTailGeometry = new THREE.BoxGeometry(0.6, 0.1, 0.7);
                crowTailGeometry.translate(-0.3, 0, 0);
                const crowTailMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
                const crowTail = new THREE.Mesh(crowTailGeometry, crowTailMaterial);
                crowTail.position.set(-0.7, 0, 0);
                crowBody.add(crowTail);

                model = crowBody;
                break;

            case 'falcon':
                // Brown falcon with distinctive features
                const falconBody = new THREE.Group();

                // Main body - streamlined for speed
                const falconBodyGeometry = new THREE.SphereGeometry(0.6, 16, 12);
                const falconBodyMaterial = new THREE.MeshPhongMaterial({
                    color: 0x8B4513, // Saddle brown
                    shininess: 20
                });
                const falconBodyMesh = new THREE.Mesh(falconBodyGeometry, falconBodyMaterial);
                falconBodyMesh.scale.set(1.2, 0.7, 0.7);
                falconBody.add(falconBodyMesh);

                // Head - sleek and aerodynamic
                const falconHeadGeometry = new THREE.SphereGeometry(0.4, 16, 12);
                const falconHeadMaterial = new THREE.MeshPhongMaterial({
                    color: 0x654321, // Darker brown
                    shininess: 20
                });
                const falconHead = new THREE.Mesh(falconHeadGeometry, falconHeadMaterial);
                falconHead.scale.set(1, 0.9, 0.8);
                falconHead.position.set(0.6, 0.25, 0);
                falconBody.add(falconHead);

                // Beak - hooked for hunting
                const falconBeakGroup = new THREE.Group();

                const falconBeakGeometry = new THREE.ConeGeometry(0.12, 0.4, 4);
                const falconBeakMaterial = new THREE.MeshPhongMaterial({
                    color: 0x111111, // Dark beak
                    shininess: 50
                });
                const falconBeak = new THREE.Mesh(falconBeakGeometry, falconBeakMaterial);
                falconBeak.rotation.z = -Math.PI / 2;
                falconBeak.position.y = 0.05;
                falconBeakGroup.add(falconBeak);

                // Hooked tip
                const hookGeometry = new THREE.SphereGeometry(0.08, 8, 8);
                hookGeometry.translate(0, -0.1, 0);
                const hookMaterial = new THREE.MeshPhongMaterial({ color: 0x111111 });
                const hook = new THREE.Mesh(hookGeometry, hookMaterial);
                hook.position.set(0.2, -0.05, 0);
                falconBeakGroup.add(hook);

                falconBeakGroup.position.set(0.95, 0.2, 0);
                falconBody.add(falconBeakGroup);

                // Wings - long and pointed
                const falconWingShape = new THREE.Shape();
                falconWingShape.moveTo(0, 0);
                falconWingShape.lineTo(0.8, 0.2);
                falconWingShape.lineTo(1.2, 0);
                falconWingShape.lineTo(0.8, -0.2);
                falconWingShape.lineTo(0, 0);

                const falconWingGeometry = new THREE.ShapeGeometry(falconWingShape);
                const falconWingMaterial = new THREE.MeshPhongMaterial({
                    color: 0x8B4513,
                    side: THREE.DoubleSide
                });

                const falconLeftWing = new THREE.Mesh(falconWingGeometry, falconWingMaterial);
                falconLeftWing.rotation.y = Math.PI / 2;
                falconLeftWing.position.set(0, 0, -0.6);
                falconBody.add(falconLeftWing);

                const falconRightWing = new THREE.Mesh(falconWingGeometry, falconWingMaterial);
                falconRightWing.rotation.y = -Math.PI / 2;
                falconRightWing.position.set(0, 0, 0.6);
                falconBody.add(falconRightWing);

                // Eyes - sharp and focused
                const falconEyeGeometry = new THREE.SphereGeometry(0.08, 8, 8);
                const falconEyeMaterial = new THREE.MeshPhongMaterial({
                    color: 0xFFD700, // Gold eyes
                    shininess: 100
                });

                const falconLeftEye = new THREE.Mesh(falconEyeGeometry, falconEyeMaterial);
                falconLeftEye.position.set(0.75, 0.35, 0.2);
                falconBody.add(falconLeftEye);

                const falconRightEye = new THREE.Mesh(falconEyeGeometry, falconEyeMaterial);
                falconRightEye.position.set(0.75, 0.35, -0.2);
                falconBody.add(falconRightEye);

                // Head crest - distinctive feature
                const crestGeometry = new THREE.ConeGeometry(0.1, 0.3, 8);
                const crestMaterial = new THREE.MeshPhongMaterial({ color: 0x654321 });
                const crest = new THREE.Mesh(crestGeometry, crestMaterial);
                crest.position.set(0.5, 0.5, 0);
                crest.rotation.z = Math.PI / 4;
                falconBody.add(crest);

                // Tail - long and tapered
                const falconTailGeometry = new THREE.BoxGeometry(0.8, 0.1, 0.5);
                falconTailGeometry.translate(-0.4, 0, 0);
                const falconTailMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
                const falconTail = new THREE.Mesh(falconTailGeometry, falconTailMaterial);
                falconTail.position.set(-0.7, 0, 0);
                falconBody.add(falconTail);

                model = falconBody;
                break;

            case 'seagull':
                // White seagull with realistic features
                const seagullBody = new THREE.Group();

                // Main body - plump but streamlined
                const seagullBodyGeometry = new THREE.SphereGeometry(0.6, 16, 12);
                const seagullBodyMaterial = new THREE.MeshPhongMaterial({
                    color: 0xFFFFFF,
                    shininess: 40
                });
                const seagullBodyMesh = new THREE.Mesh(seagullBodyGeometry, seagullBodyMaterial);
                seagullBodyMesh.scale.set(1.1, 0.8, 0.9);
                seagullBody.add(seagullBodyMesh);

                // Head - rounded
                const seagullHeadGeometry = new THREE.SphereGeometry(0.4, 16, 12);
                const seagullHeadMaterial = new THREE.MeshPhongMaterial({
                    color: 0xFFFFFF,
                    shininess: 40
                });
                const seagullHead = new THREE.Mesh(seagullHeadGeometry, seagullHeadMaterial);
                seagullHead.position.set(0.6, 0.3, 0);
                seagullBody.add(seagullHead);

                // Beak - long and pointed with characteristic shape
                const seagullBeakGroup = new THREE.Group();

                // Main part of beak
                const seagullBeakGeometry = new THREE.ConeGeometry(0.1, 0.6, 4);
                const seagullBeakMaterial = new THREE.MeshPhongMaterial({
                    color: 0xFFA500, // Orange beak
                    shininess: 50
                });
                const seagullBeak = new THREE.Mesh(seagullBeakGeometry, seagullBeakMaterial);
                seagullBeak.rotation.z = -Math.PI / 2;
                seagullBeakGroup.add(seagullBeak);

                // Characteristic hook at tip
                const seagullHookGeometry = new THREE.SphereGeometry(0.06, 8, 8);
                seagullHookGeometry.translate(0, -0.1, 0);
                const seagullHookMaterial = new THREE.MeshPhongMaterial({ color: 0xFFA500 });
                const seagullHook = new THREE.Mesh(seagullHookGeometry, seagullHookMaterial);
                seagullHook.position.set(0.3, -0.05, 0);
                seagullBeakGroup.add(seagullHook);

                seagullBeakGroup.position.set(1.0, 0.25, 0);
                seagullBody.add(seagullBeakGroup);

                // Wings - long and curved
                const seagullWingGeometry = new THREE.BoxGeometry(0.4, 0.1, 1.2);
                seagullWingGeometry.translate(0, 0, -0.6);
                const seagullWingMaterial = new THREE.MeshPhongMaterial({
                    color: 0xEEEEEE,
                    shininess: 40
                });

                const seagullLeftWing = new THREE.Mesh(seagullWingGeometry, seagullWingMaterial);
                seagullLeftWing.position.set(0, 0.1, 0);
                seagullBody.add(seagullLeftWing);

                const seagullRightWingGeometry = new THREE.BoxGeometry(0.4, 0.1, 1.2);
                seagullRightWingGeometry.translate(0, 0, 0.6);
                const seagullRightWing = new THREE.Mesh(seagullRightWingGeometry, seagullWingMaterial);
                seagullRightWing.position.set(0, 0.1, 0);
                seagullBody.add(seagullRightWing);

                // Eyes - beady
                const seagullEyeGeometry = new THREE.SphereGeometry(0.08, 8, 8);
                const seagullEyeMaterial = new THREE.MeshPhongMaterial({
                    color: 0x000000,
                    shininess: 100
                });

                const seagullLeftEye = new THREE.Mesh(seagullEyeGeometry, seagullEyeMaterial);
                seagullLeftEye.position.set(0.8, 0.4, 0.2);
                seagullBody.add(seagullLeftEye);

                const seagullRightEye = new THREE.Mesh(seagullEyeGeometry, seagullEyeMaterial);
                seagullRightEye.position.set(0.8, 0.4, -0.2);
                seagullBody.add(seagullRightEye);

                // Gray wing tips - characteristic of seagulls
                const wingTipGeometry = new THREE.BoxGeometry(0.2, 0.1, 0.3);
                const wingTipMaterial = new THREE.MeshPhongMaterial({ color: 0xAAAAAA });

                const leftWingTip = new THREE.Mesh(wingTipGeometry, wingTipMaterial);
                leftWingTip.position.set(0, 0.1, -1.3);
                seagullBody.add(leftWingTip);

                const rightWingTip = new THREE.Mesh(wingTipGeometry, wingTipMaterial);
                rightWingTip.position.set(0, 0.1, 1.3);
                seagullBody.add(rightWingTip);

                // Tail - fan-shaped
                const seagullTailGeometry = new THREE.BoxGeometry(0.5, 0.1, 0.6);
                seagullTailGeometry.translate(-0.25, 0, 0);
                const seagullTailMaterial = new THREE.MeshPhongMaterial({ color: 0xEEEEEE });
                const seagullTail = new THREE.Mesh(seagullTailGeometry, seagullTailMaterial);
                seagullTail.position.set(-0.7, 0.1, 0);
                seagullBody.add(seagullTail);

                model = seagullBody;
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