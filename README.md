# 😊 Smile Detection Web App

A real-time web application that detects smiles on faces using your camera and displays fun emojis when a smile is detected.

## Features

- **Real-time face detection** using MediaPipe
- **Smile recognition** based on facial landmark analysis
- **Animated emoji overlay** when smiles are detected
- **Modern, responsive UI** with beautiful gradients and animations
- **Cross-browser compatibility** (Chrome, Firefox, Safari, Edge)
- **Mobile-friendly** responsive design

## How it Works

1. The app uses MediaPipe's Face Mesh model to detect facial landmarks in real-time
2. It analyzes the mouth corner positions and lip movements to determine if someone is smiling
3. When a smile is detected, it displays a random emoji with a bounce animation
4. The video feed gets a subtle glow effect during smile detection

## Usage

1. Open `index.html` in a modern web browser
2. Click "Start Camera" to begin
3. Allow camera access when prompted
4. Smile at the camera to see the magic happen! 😊

## Technical Details

### Smile Detection Algorithm

The app uses facial landmarks to detect smiles by:
- Analyzing mouth corner positions relative to the mouth center
- Calculating the mouth width-to-height aspect ratio
- Detecting upward movement of mouth corners
- Applying thresholds to avoid false positives

### Key Landmarks Used
- Point 1: Nose tip (face center reference)
- Points 61, 291: Left and right mouth corners
- Points 13, 14: Upper and lower lip centers

### Dependencies

- MediaPipe Face Mesh for facial landmark detection
- MediaPipe Face Detection for face detection
- MediaPipe Camera Utils for camera handling

## Browser Requirements

- Modern web browser with WebRTC support
- Camera access permission
- JavaScript enabled

## Development

To run locally:
1. Serve the files using a local web server (required for camera access)
2. For example: `python -m http.server 8000` or `npx serve`
3. Open `http://localhost:8000` in your browser

## Customization

You can easily customize:
- Emoji selection in the `drawEmoji()` method
- Smile detection sensitivity by adjusting thresholds
- Animation styles in `styles.css`
- UI colors and layout

## Privacy

- All processing happens locally in your browser
- No data is sent to external servers
- Camera feed is not recorded or stored
