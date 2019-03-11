// -- création de notre canvas 
const canvas = document.querySelector('canvas');
// -- création de notre context 
const context = canvas.getContext('2d');

// -- debut de l'application
const controller = new Leap.Controller();
controller.connect(); // -- Ouvre la connexion WebSocket

// -- on écoute le controller
controller.on('frame', (frame) => {

    // -- on définit notre couleur 
    context.fillStyle = 'white';

    let hand = frame.hands[0];
    if (!hand) return; // -- si aucune main on return 

    const tipPos = get2dCoords(hand.indexFinger.tipPosition, frame, canvas)

    context.fillRect(
        tipPos.x,
        tipPos.y,
        5,
        5
    );
    //console.log(`Frame event for frame ${frame.id}`);
});

function get2dCoords(leapPosition, frame, canvas){

    const interactionBox = frame.interactionBox;
    const normalizedPoint = interactionBox.normalizePoint(leapPosition, true);

    return {
        x : normalizedPoint[0] * canvas.width,
        y : (1 - normalizedPoint[1]) * canvas.height
    }

}