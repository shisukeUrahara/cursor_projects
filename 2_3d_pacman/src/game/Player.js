import { GAME_SETTINGS, COLORS } from '../utils/Constants.js';

export class Player {
    constructor() {
        this.speed = GAME_SETTINGS.PLAYER_SPEED;
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3(1, 0, 0);
        this.isMoving = false;
        this.mouthAngle = 0;
        this.tempTarget = new THREE.Vector3();
        this.tempDirection = new THREE.Vector3();
        this.mesh = this.createMesh();
    }

    createMesh() {
        const group = new THREE.Group();

        // Create the main sphere
        const geometry = new THREE.SphereGeometry(0.5, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            color: COLORS.PLAYER,
            shininess: 100
        });
        this.body = new THREE.Mesh(geometry, material);
        group.add(this.body);

        // Create eyes
        const eyeGeometry = new THREE.SphereGeometry(0.08, 16, 16);
        const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });

        this.leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        this.leftEye.position.set(0.2, 0.2, 0.4);

        this.rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        this.rightEye.position.set(-0.2, 0.2, 0.4);

        group.add(this.leftEye);
        group.add(this.rightEye);

        group.position.y = 0.5;
        return group;
    }

    handleInput(key) {
        const speed = this.speed;
        const newDirection = this.tempDirection.set(0, 0, 0);

        switch (key) {
            case 'ArrowUp':
            case 'w':
                newDirection.set(0, 0, -1);
                break;
            case 'ArrowDown':
            case 's':
                newDirection.set(0, 0, 1);
                break;
            case 'ArrowLeft':
            case 'a':
                newDirection.set(-1, 0, 0);
                break;
            case 'ArrowRight':
            case 'd':
                newDirection.set(1, 0, 0);
                break;
            default:
                return;
        }

        if (newDirection.length() > 0) {
            this.direction.copy(newDirection);
            this.velocity.copy(newDirection).multiplyScalar(speed);
            this.isMoving = true;

            // Rotate Pac-Man to face movement direction
            const angle = Math.atan2(this.direction.x, this.direction.z);
            this.mesh.rotation.y = angle;
        }
    }

    update(deltaTime) {
        if (!this.isMoving) {
            return;
        }

        this.mesh.position.addScaledVector(this.velocity, deltaTime);

        // Animate mouth
        this.mouthAngle += deltaTime * 6;
        const mouthOpen = 0.2 + Math.abs(Math.sin(this.mouthAngle)) * 0.35;
        this.body.scale.set(1, 1, 1);
        this.body.scale.z = 1 - mouthOpen;

        // Update eyes to look in movement direction
        this.tempTarget.copy(this.mesh.position).addScaledVector(this.direction, 1.2);
        this.leftEye.lookAt(this.tempTarget);
        this.rightEye.lookAt(this.tempTarget);
    }

    die() {
        // Death animation
        const duration = 1000;
        const startScale = this.mesh.scale.clone();

        return new Promise(resolve => {
            const startTime = Date.now();

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);

                this.mesh.scale.setScalar(startScale.x * (1 - progress));
                this.mesh.rotation.y += 0.2;

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };

            animate();
        });
    }
} 