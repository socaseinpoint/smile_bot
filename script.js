class SmileDetectionApp {
    constructor() {
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.emojiOverlay = document.getElementById('emoji-overlay');
        this.startBtn = document.getElementById('start-btn');
        this.stopBtn = document.getElementById('stop-btn');
        this.status = document.getElementById('status');
        
        this.camera = null;
        this.faceMesh = null;
        this.faceDetection = null;
        this.isRunning = false;
        this.lastSmileTime = 0;
        this.smileThreshold = 0.7;
        
        this.init();
    }
    
    init() {
        this.startBtn.addEventListener('click', () => this.startCamera());
        this.stopBtn.addEventListener('click', () => this.stopCamera());
        
        this.video.addEventListener('loadedmetadata', () => {
            this.canvas.width = this.video.videoWidth;
            this.canvas.height = this.video.videoHeight;
        });
        
        this.setupMediaPipe();
    }
    
    setupMediaPipe() {
        // Initialize Face Detection
        this.faceDetection = new FaceDetection({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`;
            }
        });
        
        this.faceDetection.setOptions({
            model: 'short',
            minDetectionConfidence: 0.5,
        });
        
        // Initialize Face Mesh for more detailed landmark detection
        this.faceMesh = new FaceMesh({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
            }
        });
        
        this.faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });
        
        this.faceMesh.onResults((results) => this.onResults(results));
    }
    
    async startCamera() {
        try {
            this.updateStatus('Requesting camera access...');
            
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                }
            });
            
            this.video.srcObject = stream;
            
            this.camera = new Camera(this.video, {
                onFrame: async () => {
                    if (this.isRunning) {
                        await this.faceMesh.send({ image: this.video });
                    }
                },
                width: 640,
                height: 480
            });
            
            await this.camera.start();
            
            this.isRunning = true;
            this.startBtn.disabled = true;
            this.stopBtn.disabled = false;
            this.updateStatus('Camera active - Smile for the camera! 😊');
            
        } catch (error) {
            console.error('Error accessing camera:', error);
            this.updateStatus('Error: Could not access camera. Please check permissions.');
        }
    }
    
    stopCamera() {
        if (this.camera) {
            this.camera.stop();
        }
        
        if (this.video.srcObject) {
            const tracks = this.video.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            this.video.srcObject = null;
        }
        
        this.isRunning = false;
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        this.updateStatus('Camera stopped');
        this.clearCanvas();
    }
    
    onResults(results) {
        this.clearCanvas();
        
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            const landmarks = results.multiFaceLandmarks[0];
            
            // Draw face landmarks (optional, for debugging)
            this.drawLandmarks(landmarks);
            
            // Detect smile
            const isSmiling = this.detectSmile(landmarks);
            
            if (isSmiling) {
                this.onSmileDetected(landmarks);
            }
        }
    }
    
    detectSmile(landmarks) {
        // Get mouth corner points and center points
        const leftMouthCorner = landmarks[61];  // Left corner of mouth
        const rightMouthCorner = landmarks[291]; // Right corner of mouth
        const upperLip = landmarks[13];          // Upper lip center
        const lowerLip = landmarks[14];          // Lower lip center
        
        // Calculate mouth width and height
        const mouthWidth = Math.abs(rightMouthCorner.x - leftMouthCorner.x);
        const mouthHeight = Math.abs(lowerLip.y - upperLip.y);
        
        // Calculate mouth corners relative to center
        const mouthCenterY = (upperLip.y + lowerLip.y) / 2;
        const leftCornerLift = mouthCenterY - leftMouthCorner.y;
        const rightCornerLift = mouthCenterY - rightMouthCorner.y;
        
        // Smile detection based on corner lift and mouth aspect ratio
        const cornerLiftThreshold = 0.005;
        const aspectRatio = mouthWidth / mouthHeight;
        
        const isSmiling = (leftCornerLift > cornerLiftThreshold && 
                          rightCornerLift > cornerLiftThreshold && 
                          aspectRatio > 2.5);
        
        return isSmiling;
    }
    
    onSmileDetected(landmarks) {
        const now = Date.now();
        
        // Throttle smile detection to avoid spam
        if (now - this.lastSmileTime < 1000) {
            return;
        }
        
        this.lastSmileTime = now;
        
        // Add glow effect to video
        this.video.classList.add('smile-detected');
        setTimeout(() => {
            this.video.classList.remove('smile-detected');
        }, 500);
        
        // Draw emoji at face position
        this.drawEmoji(landmarks);
        
        this.updateStatus('Smile detected! 😄');
    }
    
    drawEmoji(landmarks) {
        // Get face center
        const nose = landmarks[1]; // Nose tip
        const faceCenter = {
            x: nose.x * this.canvas.width,
            y: nose.y * this.canvas.height
        };
        
        // Create emoji element
        const emojis = ['😊', '😄', '😃', '🙂', '😁', '🤗', '😍', '🥰'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        
        const emojiElement = document.createElement('div');
        emojiElement.className = 'emoji';
        emojiElement.textContent = randomEmoji;
        emojiElement.style.left = `${faceCenter.x - 25}px`;
        emojiElement.style.top = `${faceCenter.y - 50}px`;
        
        this.emojiOverlay.appendChild(emojiElement);
        
        // Remove emoji after animation
        setTimeout(() => {
            if (emojiElement.parentNode) {
                emojiElement.parentNode.removeChild(emojiElement);
            }
        }, 2000);
    }
    
    drawLandmarks(landmarks) {
        this.ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
        
        // Draw key facial points
        const keyPoints = [1, 61, 291, 13, 14]; // Nose, mouth corners, lips
        
        keyPoints.forEach(index => {
            if (landmarks[index]) {
                const x = landmarks[index].x * this.canvas.width;
                const y = landmarks[index].y * this.canvas.height;
                
                this.ctx.beginPath();
                this.ctx.arc(x, y, 3, 0, 2 * Math.PI);
                this.ctx.fill();
            }
        });
        
        // Draw mouth outline
        this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        
        // Mouth outline points
        const mouthPoints = [61, 84, 17, 314, 405, 320, 307, 375, 321, 308, 324, 318];
        
        mouthPoints.forEach((index, i) => {
            if (landmarks[index]) {
                const x = landmarks[index].x * this.canvas.width;
                const y = landmarks[index].y * this.canvas.height;
                
                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
        });
        
        this.ctx.closePath();
        this.ctx.stroke();
    }
    
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    updateStatus(message) {
        this.status.textContent = message;
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SmileDetectionApp();
});

// Handle page visibility change
document.addEventListener('visibilitychange', () => {
    if (document.hidden && window.app) {
        // Pause detection when tab is not visible
        window.app.isRunning = false;
    } else if (!document.hidden && window.app && window.app.camera) {
        // Resume detection when tab becomes visible
        window.app.isRunning = true;
    }
});
