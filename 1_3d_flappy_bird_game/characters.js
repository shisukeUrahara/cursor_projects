class CharacterManager {
    constructor() {
        this.characters = {
            bird: null,
            bitcoin: null,
            ethereum: null,
            polygon: null
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
            'bitcoin-preview',
            'ethereum-preview',
            'polygon-preview'
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
                // Create bird model
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
                break;

            case 'bitcoin':
                // Create Bitcoin model (gold coin)
                const btcGeometry = new THREE.CylinderGeometry(1, 1, 0.2, 32);
                const btcMaterial = new THREE.MeshPhongMaterial({
                    color: 0xF7931A,
                    metalness: 0.8,
                    roughness: 0.2
                });
                model = new THREE.Mesh(btcGeometry, btcMaterial);
                // Show front view instead of side view
                model.rotation.x = 0;

                // Create Bitcoin symbol (B shape using simple geometry)
                const btcSymbolGeometry = new THREE.BoxGeometry(0.5, 0.8, 0.1);
                const btcSymbolMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFFFF });
                const btcSymbol = new THREE.Mesh(btcSymbolGeometry, btcSymbolMaterial);
                btcSymbol.position.set(0, 0, 0.15);
                model.add(btcSymbol);

                // Add a second vertical line to make it look more like ₿
                const btcSymbolLine = new THREE.BoxGeometry(0.15, 0.6, 0.1);
                const btcSymbolLine2 = new THREE.Mesh(btcSymbolLine, btcSymbolMaterial);
                btcSymbolLine2.position.set(0.1, 0, 0.2);
                model.add(btcSymbolLine2);
                break;

            case 'ethereum':
                // Create Ethereum model (silver-blue coin)
                const ethGeometry = new THREE.CylinderGeometry(1, 1, 0.2, 32);
                const ethMaterial = new THREE.MeshPhongMaterial({
                    color: 0x627EEA,
                    metalness: 0.6,
                    roughness: 0.3
                });
                model = new THREE.Mesh(ethGeometry, ethMaterial);
                // Show front view instead of side view
                model.rotation.x = 0;

                // Add Ethereum symbol (simplified)
                const ethSymbolGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.1);
                const ethSymbolMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFFFF });
                const ethSymbol = new THREE.Mesh(ethSymbolGeometry, ethSymbolMaterial);
                ethSymbol.position.set(0, 0, 0.15);
                model.add(ethSymbol);
                break;

            case 'polygon':
                // Create Polygon model (purple coin)
                const polyGeometry = new THREE.CylinderGeometry(1, 1, 0.2, 32);
                const polyMaterial = new THREE.MeshPhongMaterial({
                    color: 0x8247E5,
                    metalness: 0.6,
                    roughness: 0.3
                });
                model = new THREE.Mesh(polyGeometry, polyMaterial);
                // Show front view instead of side view
                model.rotation.x = 0;

                // Add Polygon symbol (simplified as a pentagon)
                const polySymbolGeometry = new THREE.CircleGeometry(0.5, 5);
                const polySymbolMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFFFF });
                const polySymbol = new THREE.Mesh(polySymbolGeometry, polySymbolMaterial);
                polySymbol.position.set(0, 0, 0.15);
                model.add(polySymbol);
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

            // Rotate the model
            if (model) {
                model.rotation.y += 0.01;
                if (type !== 'bird') {
                    // For coins, rotate around y-axis only to show front face
                    model.rotation.z = 0;
                }
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