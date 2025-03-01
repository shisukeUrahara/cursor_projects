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
                // Classic yellow bird - enhanced with more details
                const birdBody = new THREE.Group();

                // Main body - smoother with gradient coloring
                const bodyGeometry = new THREE.SphereGeometry(0.6, 24, 18);
                const bodyMaterial = new THREE.MeshPhongMaterial({
                    color: 0xFFFF00,
                    shininess: 30,
                    specular: 0x333333
                });
                const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
                body.scale.set(1.1, 0.8, 0.9);
                birdBody.add(body);

                // Chest/belly area - slightly different color
                const bellyGeometry = new THREE.SphereGeometry(0.55, 16, 12);
                const bellyMaterial = new THREE.MeshPhongMaterial({
                    color: 0xFFFF66, // Lighter yellow
                    shininess: 20
                });
                const belly = new THREE.Mesh(bellyGeometry, bellyMaterial);
                belly.position.set(0.1, -0.1, 0);
                belly.scale.set(0.9, 0.8, 0.85);
                birdBody.add(belly);

                // Head - more detailed with smoother transitions
                const headGeometry = new THREE.SphereGeometry(0.4, 24, 18);
                const headMaterial = new THREE.MeshPhongMaterial({
                    color: 0xFFFF00,
                    shininess: 30,
                    specular: 0x333333
                });
                const head = new THREE.Mesh(headGeometry, headMaterial);
                head.position.set(0.55, 0.25, 0);
                birdBody.add(head);

                // Neck - to connect head and body smoothly
                const neckGeometry = new THREE.CylinderGeometry(0.3, 0.4, 0.2, 16);
                const neckMaterial = new THREE.MeshPhongMaterial({
                    color: 0xFFFF00,
                    shininess: 30
                });
                const neck = new THREE.Mesh(neckGeometry, neckMaterial);
                neck.rotation.z = Math.PI / 2.5;
                neck.position.set(0.3, 0.15, 0);
                birdBody.add(neck);

                // Wings - more detailed with feather-like structure
                // Left wing
                const leftWingGroup = new THREE.Group();

                // Main wing shape
                const wingShape = new THREE.Shape();
                wingShape.moveTo(0, 0);
                wingShape.quadraticCurveTo(0.4, 0.3, 0.8, 0);
                wingShape.quadraticCurveTo(0.4, -0.4, 0, 0);

                const wingGeometry = new THREE.ShapeGeometry(wingShape);
                const wingMaterial = new THREE.MeshPhongMaterial({
                    color: 0xFFCC00, // Slightly darker yellow for wings
                    side: THREE.DoubleSide,
                    shininess: 20
                });

                const leftWingBase = new THREE.Mesh(wingGeometry, wingMaterial);
                leftWingBase.rotation.y = Math.PI / 2;
                leftWingGroup.add(leftWingBase);

                // Add feather details
                for (let i = 0; i < 5; i++) {
                    const featherGeometry = new THREE.PlaneGeometry(0.3, 0.08);
                    const featherMaterial = new THREE.MeshPhongMaterial({
                        color: 0xFFCC00,
                        side: THREE.DoubleSide,
                        transparent: true,
                        opacity: 0.9
                    });
                    const feather = new THREE.Mesh(featherGeometry, featherMaterial);
                    feather.position.set(0.1, -0.15 + i * 0.08, 0.05);
                    feather.rotation.z = -Math.PI / 8;
                    leftWingGroup.add(feather);
                }

                leftWingGroup.position.set(0, 0, -0.6);
                birdBody.add(leftWingGroup);

                // Right wing (mirror of left)
                const rightWingGroup = leftWingGroup.clone();
                rightWingGroup.rotation.y = Math.PI;
                rightWingGroup.position.set(0, 0, 0.6);
                birdBody.add(rightWingGroup);

                // Beak - more detailed with upper and lower parts
                const beakGroup = new THREE.Group();

                // Upper beak
                const upperBeakGeometry = new THREE.ConeGeometry(0.12, 0.35, 4);
                const beakMaterial = new THREE.MeshPhongMaterial({
                    color: 0xFF6600,
                    shininess: 50
                });
                const upperBeak = new THREE.Mesh(upperBeakGeometry, beakMaterial);
                upperBeak.rotation.z = -Math.PI / 2;
                upperBeak.position.set(0, 0.02, 0);
                beakGroup.add(upperBeak);

                // Lower beak
                const lowerBeakGeometry = new THREE.ConeGeometry(0.1, 0.25, 4);
                const lowerBeakMaterial = new THREE.MeshPhongMaterial({
                    color: 0xE55500, // Slightly darker
                    shininess: 50
                });
                const lowerBeak = new THREE.Mesh(lowerBeakGeometry, lowerBeakMaterial);
                lowerBeak.rotation.z = -Math.PI / 2;
                lowerBeak.position.set(0, -0.05, 0);
                beakGroup.add(lowerBeak);

                beakGroup.position.set(0.95, 0.25, 0);
                birdBody.add(beakGroup);

                // Eyes - more detailed with pupils and highlights
                const eyeGroup = new THREE.Group();

                // White of the eye
                const eyeWhiteGeometry = new THREE.SphereGeometry(0.09, 12, 12);
                const eyeWhiteMaterial = new THREE.MeshPhongMaterial({
                    color: 0xFFFFFF,
                    shininess: 80
                });

                // Left eye
                const leftEyeWhite = new THREE.Mesh(eyeWhiteGeometry, eyeWhiteMaterial);
                leftEyeWhite.position.set(0.75, 0.35, 0.22);
                birdBody.add(leftEyeWhite);

                // Left pupil
                const pupilGeometry = new THREE.SphereGeometry(0.05, 10, 10);
                const pupilMaterial = new THREE.MeshPhongMaterial({
                    color: 0x000000,
                    shininess: 100
                });
                const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
                leftPupil.position.set(0.82, 0.35, 0.22);
                birdBody.add(leftPupil);

                // Left eye highlight
                const highlightGeometry = new THREE.SphereGeometry(0.02, 8, 8);
                const highlightMaterial = new THREE.MeshBasicMaterial({
                    color: 0xFFFFFF
                });
                const leftHighlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
                leftHighlight.position.set(0.84, 0.37, 0.24);
                birdBody.add(leftHighlight);

                // Right eye (mirror of left)
                const rightEyeWhite = new THREE.Mesh(eyeWhiteGeometry, eyeWhiteMaterial);
                rightEyeWhite.position.set(0.75, 0.35, -0.22);
                birdBody.add(rightEyeWhite);

                const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
                rightPupil.position.set(0.82, 0.35, -0.22);
                birdBody.add(rightPupil);

                const rightHighlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
                rightHighlight.position.set(0.84, 0.37, -0.24);
                birdBody.add(rightHighlight);

                // Tail feathers - more detailed fan shape
                const tailGroup = new THREE.Group();

                // Create multiple tail feathers
                const tailFeatherColors = [0xFFCC00, 0xFFBB00, 0xFFDD00];
                for (let i = 0; i < 5; i++) {
                    const featherGeometry = new THREE.PlaneGeometry(0.4, 0.12);
                    const featherMaterial = new THREE.MeshPhongMaterial({
                        color: tailFeatherColors[i % 3],
                        side: THREE.DoubleSide,
                        transparent: true,
                        opacity: 0.9
                    });
                    const feather = new THREE.Mesh(featherGeometry, featherMaterial);
                    feather.position.set(0, 0, -0.2 + i * 0.1);
                    feather.rotation.y = (i - 2) * Math.PI / 15;
                    tailGroup.add(feather);
                }

                tailGroup.position.set(-0.7, 0, 0);
                birdBody.add(tailGroup);

                // Feet
                const footMaterial = new THREE.MeshPhongMaterial({
                    color: 0xFF6600,
                    shininess: 30
                });

                // Left foot
                const leftFootGroup = new THREE.Group();

                const leftLegGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8);
                const leftLeg = new THREE.Mesh(leftLegGeometry, footMaterial);
                leftLeg.position.set(0, -0.15, 0);
                leftFootGroup.add(leftLeg);

                // Toes
                for (let i = 0; i < 3; i++) {
                    const toeGeometry = new THREE.CylinderGeometry(0.02, 0.01, 0.15, 8);
                    const toe = new THREE.Mesh(toeGeometry, footMaterial);
                    toe.rotation.x = Math.PI / 2;
                    toe.rotation.z = (i - 1) * Math.PI / 6;
                    toe.position.set(0, -0.3, 0);
                    leftFootGroup.add(toe);
                }

                leftFootGroup.position.set(0, -0.4, -0.2);
                birdBody.add(leftFootGroup);

                // Right foot (mirror of left)
                const rightFootGroup = leftFootGroup.clone();
                rightFootGroup.position.set(0, -0.4, 0.2);
                birdBody.add(rightFootGroup);

                model = birdBody;
                break;

            case 'crow':
                // Enhanced black crow with more realistic features
                const crowBody = new THREE.Group();

                // Main body - sleeker shape with iridescent effect
                const crowBodyGeometry = new THREE.SphereGeometry(0.6, 24, 18);
                const crowBodyMaterial = new THREE.MeshPhongMaterial({
                    color: 0x222222,
                    shininess: 10,
                    specular: 0x444444 // Slight iridescence
                });
                const crowBodyMesh = new THREE.Mesh(crowBodyGeometry, crowBodyMaterial);
                crowBodyMesh.scale.set(1.2, 0.7, 0.8);
                crowBody.add(crowBodyMesh);

                // Neck feathers - ruffled appearance
                const neckFeathersGeometry = new THREE.SphereGeometry(0.4, 16, 8);
                const neckFeathersMaterial = new THREE.MeshPhongMaterial({
                    color: 0x333333,
                    shininess: 5
                });
                const neckFeathers = new THREE.Mesh(neckFeathersGeometry, neckFeathersMaterial);
                neckFeathers.scale.set(0.8, 0.6, 0.7);
                neckFeathers.position.set(0.3, 0.1, 0);
                crowBody.add(neckFeathers);

                // Head - more angular and detailed
                const crowHeadGeometry = new THREE.SphereGeometry(0.45, 24, 18);
                const crowHeadMaterial = new THREE.MeshPhongMaterial({
                    color: 0x111111, // Darker than body
                    shininess: 10,
                    specular: 0x444444
                });
                const crowHead = new THREE.Mesh(crowHeadGeometry, crowHeadMaterial);
                crowHead.scale.set(0.9, 0.9, 0.8);
                crowHead.position.set(0.6, 0.3, 0);
                crowBody.add(crowHead);

                // Beak - sharper and more pointed with texture
                const crowBeakGroup = new THREE.Group();

                // Upper beak
                const crowUpperBeakGeometry = new THREE.ConeGeometry(0.1, 0.5, 4);
                const crowBeakMaterial = new THREE.MeshPhongMaterial({
                    color: 0x111111,
                    shininess: 30
                });
                const crowUpperBeak = new THREE.Mesh(crowUpperBeakGeometry, crowBeakMaterial);
                crowUpperBeak.rotation.z = -Math.PI / 2;
                crowBeakGroup.add(crowUpperBeak);

                // Lower beak
                const crowLowerBeakGeometry = new THREE.ConeGeometry(0.08, 0.4, 4);
                const crowLowerBeak = new THREE.Mesh(crowLowerBeakGeometry, crowBeakMaterial);
                crowLowerBeak.rotation.z = -Math.PI / 2;
                crowLowerBeak.position.set(0, -0.05, 0);
                crowBeakGroup.add(crowLowerBeak);

                crowBeakGroup.position.set(1.05, 0.25, 0);
                crowBody.add(crowBeakGroup);

                // Wings - more detailed with feather structure
                // Left wing
                const crowLeftWingGroup = new THREE.Group();

                // Primary wing shape
                const crowWingShape = new THREE.Shape();
                crowWingShape.moveTo(0, 0);
                crowWingShape.lineTo(0.8, 0.2);
                crowWingShape.lineTo(1.0, 0);
                crowWingShape.lineTo(0.8, -0.3);
                crowWingShape.lineTo(0, 0);

                const crowWingGeometry = new THREE.ShapeGeometry(crowWingShape);
                const crowWingMaterial = new THREE.MeshPhongMaterial({
                    color: 0x222222,
                    side: THREE.DoubleSide,
                    shininess: 5
                });

                const crowLeftWingBase = new THREE.Mesh(crowWingGeometry, crowWingMaterial);
                crowLeftWingBase.rotation.y = Math.PI / 2;
                crowLeftWingGroup.add(crowLeftWingBase);

                // Add primary feathers
                for (let i = 0; i < 7; i++) {
                    const featherGeometry = new THREE.PlaneGeometry(0.4, 0.1);
                    const featherMaterial = new THREE.MeshPhongMaterial({
                        color: 0x222222,
                        side: THREE.DoubleSide,
                        transparent: true,
                        opacity: 0.9
                    });
                    const feather = new THREE.Mesh(featherGeometry, featherMaterial);
                    feather.position.set(0.4, -0.2 + i * 0.06, 0.05);
                    feather.rotation.z = -Math.PI / 10;
                    crowLeftWingGroup.add(feather);
                }

                crowLeftWingGroup.position.set(0, 0, -0.6);
                crowBody.add(crowLeftWingGroup);

                // Right wing (mirror of left)
                const crowRightWingGroup = crowLeftWingGroup.clone();
                crowRightWingGroup.rotation.y = Math.PI;
                crowRightWingGroup.position.set(0, 0, 0.6);
                crowBody.add(crowRightWingGroup);

                // Eyes - piercing with detail
                // Left eye
                const crowEyeGeometry = new THREE.SphereGeometry(0.08, 16, 16);
                const crowEyeMaterial = new THREE.MeshPhongMaterial({
                    color: 0xDDDDDD, // Light gray
                    shininess: 80
                });

                const crowLeftEye = new THREE.Mesh(crowEyeGeometry, crowEyeMaterial);
                crowLeftEye.position.set(0.8, 0.4, 0.2);
                crowBody.add(crowLeftEye);

                // Left pupil
                const crowPupilGeometry = new THREE.SphereGeometry(0.04, 10, 10);
                const crowPupilMaterial = new THREE.MeshPhongMaterial({
                    color: 0x000000,
                    shininess: 100
                });
                const crowLeftPupil = new THREE.Mesh(crowPupilGeometry, crowPupilMaterial);
                crowLeftPupil.position.set(0.85, 0.4, 0.2);
                crowBody.add(crowLeftPupil);

                // Right eye
                const crowRightEye = new THREE.Mesh(crowEyeGeometry, crowEyeMaterial);
                crowRightEye.position.set(0.8, 0.4, -0.2);
                crowBody.add(crowRightEye);

                const crowRightPupil = new THREE.Mesh(crowPupilGeometry, crowPupilMaterial);
                crowRightPupil.position.set(0.85, 0.4, -0.2);
                crowBody.add(crowRightPupil);

                // Tail - fan-shaped with individual feathers
                const crowTailGroup = new THREE.Group();

                // Create multiple tail feathers
                for (let i = 0; i < 7; i++) {
                    const tailFeatherGeometry = new THREE.PlaneGeometry(0.6, 0.12);
                    const tailFeatherMaterial = new THREE.MeshPhongMaterial({
                        color: 0x222222,
                        side: THREE.DoubleSide,
                        transparent: true,
                        opacity: 0.9
                    });
                    const tailFeather = new THREE.Mesh(tailFeatherGeometry, tailFeatherMaterial);
                    tailFeather.position.set(0, 0, -0.3 + i * 0.1);
                    tailFeather.rotation.y = (i - 3) * Math.PI / 20;
                    crowTailGroup.add(tailFeather);
                }

                crowTailGroup.position.set(-0.7, 0, 0);
                crowBody.add(crowTailGroup);

                // Feet - scaly texture
                const crowFootMaterial = new THREE.MeshPhongMaterial({
                    color: 0x111111,
                    shininess: 20
                });

                // Left foot
                const crowLeftFootGroup = new THREE.Group();

                const crowLeftLegGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8);
                const crowLeftLeg = new THREE.Mesh(crowLeftLegGeometry, crowFootMaterial);
                crowLeftLeg.position.set(0, -0.15, 0);
                crowLeftFootGroup.add(crowLeftLeg);

                // Toes
                for (let i = 0; i < 3; i++) {
                    const crowToeGeometry = new THREE.CylinderGeometry(0.02, 0.01, 0.2, 8);
                    const crowToe = new THREE.Mesh(crowToeGeometry, crowFootMaterial);
                    crowToe.rotation.x = Math.PI / 2;
                    crowToe.rotation.z = (i - 1) * Math.PI / 5;
                    crowToe.position.set(0, -0.3, 0);
                    crowLeftFootGroup.add(crowToe);
                }

                crowLeftFootGroup.position.set(0, -0.4, -0.2);
                crowBody.add(crowLeftFootGroup);

                // Right foot (mirror of left)
                const crowRightFootGroup = crowLeftFootGroup.clone();
                crowRightFootGroup.position.set(0, -0.4, 0.2);
                crowBody.add(crowRightFootGroup);

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

        let time = 0;

        const animate = () => {
            requestAnimationFrame(animate);
            time += 0.03;

            // More lifelike animation for preview
            if (model) {
                // Gentle rotation
                model.rotation.y = Math.sin(time * 0.5) * 0.3 + Math.PI / 4;

                // Slight bobbing motion
                model.position.y = Math.sin(time) * 0.05;

                // Find and animate wings if they exist
                model.children.forEach(child => {
                    // Look for wing groups
                    if (child.name && child.name.includes('wing')) {
                        // Flap wings occasionally
                        if (Math.sin(time * 2) > 0.7) {
                            if (child.name.includes('left')) {
                                child.rotation.z = Math.sin(time * 10) * 0.2;
                            } else if (child.name.includes('right')) {
                                child.rotation.z = -Math.sin(time * 10) * 0.2;
                            }
                        }
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