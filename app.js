const canvas  = document.querySelector('canvas'); // Récupération du <canvas>
const context = canvas.getContext('2d'); // Obtention du contexte de dessin 2d

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const controller = new Leap.Controller({enableGestures: true}); // Initialisation du contrôleur Leap Motion
controller.connect(); // Ouvre la connexion WebSocket vers le service Leap de l'ordinateur

const ball = {
    x    : canvas.width / 2,
    y    : canvas.height / 2,
    size : 100,
};

// À chaque "frame" détectée par le device, on exécute une fonction qui récupère cet objet "frame" ...
controller.on('frame', function(frame) {

    // Efface le canvas
    context.fillStyle = 'rgba(0, 0, 0, 0.3)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Détection des gestures
    frame.gestures.forEach(function(gesture) {
        switch (gesture.type) {
            case 'swipe':
                renderSwipe(frame, gesture);
                break;

            case 'circle':
                renderCircle(frame, gesture);
                break;
            
            case 'keyTap':
                renderKeyTap(frame, gesture);
                break;
        }
    });
    
    // Récupération de chaque main détectée...
    frame.hands.forEach(function(hand) {

        console.log('GRAB', hand.grabStrength);
        
        // Dessin de la paume
        const palmPosition = get2dCoords(hand.stabilizedPalmPosition, frame, canvas);
        context.fillStyle = 'yellow';
        context.fillRect(palmPosition.x, palmPosition.y, 15, 15);

        // Pour cette main : Récupération de la position de chaque doigt...
        hand.fingers.forEach(function(finger) {
            // Conversion des coordonnées du doigt de 3D vers 2D
            const fingerMcp = get2dCoords(finger.mcpPosition, frame, canvas);
            const fingerPip = get2dCoords(finger.pipPosition, frame, canvas);
            const fingerDip = get2dCoords(finger.dipPosition, frame, canvas);
            const fingerCarp = get2dCoords(finger.carpPosition, frame, canvas);
            const fingerTip = get2dCoords(finger.stabilizedTipPosition, frame, canvas);
            
            // Dessin d'un carré de 5x5 à la position
            context.fillStyle = 'white';
            context.fillRect(fingerMcp.x, fingerMcp.y, 5, 5);
            context.fillRect(fingerPip.x, fingerPip.y, 5, 5);
            context.fillRect(fingerDip.x, fingerDip.y, 5, 5);
            context.fillRect(fingerCarp.x, fingerCarp.y, 5, 5);
            context.fillStyle = '#09F'; // bleu clair
            context.fillRect(fingerTip.x, fingerTip.y, 10, 10);
        });

        // Toujours pour cette main, vérification du grab
        dragBall(hand, frame);

    });

    // Dessin de la balle
    context.fillStyle = 'red';
    context.beginPath();
    context.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    context.fill();
    context.closePath();

});

function dragBall(hand, frame) {
    if (hand.grabStrength === 1) {
        const palmPosition = get2dCoords(hand.stabilizedPalmPosition, frame, canvas);
        ball.x = palmPosition.x;
        ball.y = palmPosition.y;
    }
}

/**
 * Dessine un gesture "swipe" à l'écran
 * @param {Object} frame Objet "frame" transmit par le Leap Motion
 * @param {Object} gesture Objet "gesture" de type "swipe" à dessiner
 */
function renderSwipe(frame, gesture) {
    const startPosition   = get2dCoords(gesture.startPosition, frame, canvas);
    const currentPosition = get2dCoords(gesture.position, frame, canvas);

    context.strokeStyle = '#0f0';
    context.beginPath();
    context.moveTo(startPosition.x, startPosition.y);
    context.lineTo(currentPosition.x, currentPosition.y);
    context.stroke();
    context.closePath();
}

/**
 * Dessine un gesture "circle" à l'écran
 * @param {Object} frame Objet "frame" transmit par le Leap Motion
 * @param {Object} gesture Objet "gesture" de type "circle" à dessiner
 */
function renderCircle(frame, gesture) {
    const centerPosition = get2dCoords(gesture.center, frame, canvas);
    const radius         = gesture.radius;

    context.strokeStyle  = 'pink';
    context.lineWidth    = 3;
    context.beginPath();
    context.arc(centerPosition.x, centerPosition.y, radius, 0, Math.PI * 2);
    context.stroke();
    context.closePath();
}

/**
 * Dessine un gesture "keyTap" à l'écran
 * @param {Object} frame Objet "frame" transmit par le Leap Motion
 * @param {Object} gesture Objet "gesture" de type "keyTap" à dessiner
 */
function renderKeyTap(frame, gesture) {
    const tapPosition = get2dCoords(gesture.position, frame, canvas);

    context.fillStyle = '#f09';
    context.beginPath();
    context.arc(tapPosition.x, tapPosition.y, 30, 0, Math.PI * 2);
    context.fill();
    context.closePath();
}

/**
 * Transforme les coordonnées 3D récupérée par le Leap en coordonnées 2D pour un <canvas> web
 * @param {Array} leapPosition Tableau de coordonnées 3D [x, y, z]
 * @param {Object} frame Objet "frame" transmit par le Leap Motion
 * @param {HTMLCanvasElement} canvas Objet canvas sur lequel sont dessinés les éléments
 */
function get2dCoords(leapPosition, frame, canvas) {
    const interactionBox  = frame.interactionBox;
    const normalizedPoint = interactionBox.normalizePoint(leapPosition, true);

    return {
        x : normalizedPoint[0] * canvas.width,
        y : (1 - normalizedPoint[1]) * canvas.height,
    }
}