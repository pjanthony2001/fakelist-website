import { createClient } from "https://esm.sh/@supabase/supabase-js";

const SUPABASE_URL = "https://nzwxjvuunmehokoefdgy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56d3hqdnV1bm1laG9rb2VmZGd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk4OTY5MzAsImV4cCI6MjA1NTQ3MjkzMH0.lh1_ApzfrMGzDD4dy0NL6s3wOR0B4v9aPEjmLj0WGCI";

// Initialiser Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


const colorsChoice = document.querySelector('#colorsChoice');
const game = document.querySelector('#game');
const cursor = document.querySelector('#cursor');
const cooldownSquare = document.createElement('div'); 
cooldownSquare.id = 'cooldownSquare';
game.width = 1000;
game.height = 500;
const gridCellSize = 10;

const ctx = game.getContext('2d');
const gridCtx = game.getContext('2d');

const colorList = [
    "#ff5a5f", "#ff784f", "#ffd166", "#ff4d94",  // Chaudes
    "#007bff", "#00b4d8", "#28a745", "#80ed99",  // Froides
    "#f4e1d2", "#343a40", "#f8f9fa", "#7b3f00",  // Neutres
    "#6f42c1", "#2a2d43", "#800020", "#d4af37",  // Profondes
    "#ff6b6b", "#1e90ff", "#2d6a4f", "#cc7722",  // Nouvelles
    "#4b0082", "#264653", "#b19cd9", "#f7cac9"   // Nouvelles
  ];
let currentColorChoice = colorList[0];
cooldownSquare.style.backgroundColor = currentColorChoice;


colorList.forEach(color => {
    const colorItem = document.createElement('div');
    colorItem.style.backgroundColor = color;
    colorsChoice.appendChild(colorItem);

    colorItem.addEventListener('click', () => {
        currentColorChoice = color;

        cooldownSquare.style.backgroundColor = currentColorChoice;

        //colorItem.innerHTML = '<i class="fa-solid fa-check"></i>';
        colorItem.innerHTML = '✔';

        setTimeout(() => {
            colorItem.innerHTML = '';
        }, 500);
    });
})

function createPixel(x, y, color){
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.fillRect(x, y, gridCellSize, gridCellSize);
}

let canPlacePixel = true; // Variable pour bloquer les clics rapides
const pixelCooldown = 5000; // Temps d'attente en millisecondes (ex: 1000ms = 1s)
let adminMode = false;

async function addPixelIntoGame(){
    if (adminMode) return; // Empêche l'ajout si le mode admin est activé
    if (!canPlacePixel) return; // Empêche l'ajout si le délai n'est pas écoulé

    canPlacePixel = false; // Bloque temporairement l'ajout d'un pixel
    
    setTimeout(() => {
        cooldownSquare.style.transition = "height 5s linear"; 
        cooldownSquare.style.height = "0"; // Réduire le carré en 10 secondes
    }, 10);

    setTimeout(() => {
        canPlacePixel = true;
        cooldownSquare.style.transition = "none"; // Retirer la transition en cours
        cooldownSquare.style.height = "9px"; // Remise à la taille initiale
    }, pixelCooldown);
    
    const x = cursor.offsetLeft - game.offsetLeft;
    const y = cursor.offsetTop - game.offsetTop;

    /*const rect = game.getBoundingClientRect();
    const x = Math.floor((cursor.offsetLeft - rect.left) / gridCellSize) * gridCellSize;
    const y = Math.floor((cursor.offsetTop - rect.top) / gridCellSize) * gridCellSize;*/

    createPixel(x, y, currentColorChoice);

    console.log('click X:', x);
    console.log('click Y:', y);

    const pixel = {
        x: x,
        y: y,
        color: currentColorChoice
    };

    const pixelData = {
        x: x,
        y: y,
        color: currentColorChoice,
        date: new Date().toISOString(),
    };
    
    /*const pixelRef = db.collection('pixels').doc(`${pixel.x}-${pixel.y}`);
    const pixelRefData = db.collection('pixelsData').doc(`${pixel.x}+${pixel.y}+${new Date().toISOString()}`);
    pixelRef.set(pixel, {merge: true});
    pixelRefData.set(pixelData, {merge: false});*/

    const { error } = await supabase.from('pixels').insert([{ x, y, color: currentColorChoice, date: new Date().toISOString() }]);
    if (error) console.error('Erreur lors de l\'insertion:', error);

}

cursor.appendChild(cooldownSquare);

cursor.addEventListener('click', function(event) {
    addPixelIntoGame(event);
});

game.addEventListener('click', function(event) {
    addPixelIntoGame();
});


function drawGrids(ctx, width, height, cellWidth, cellHeight){
    ctx.beginPath();
    ctx.strokeStyle = "#ccc"

    for(let i = 0; i < width; i++){
        ctx.moveTo(i * cellWidth, 0);
        ctx.lineTo(i * cellWidth, height);
    }

    for(let i = 0; i < height; i++){
        ctx.moveTo(0, i * cellHeight);
        ctx.lineTo(width, i * cellWidth);
    }
    ctx.stroke();
}
drawGrids(gridCtx, game.width, game.height, gridCellSize, gridCellSize);

async function test(x,y,currentColorChoice){
    const pixel = {
        x: x,
        y: y,
        color: currentColorChoice
    };

    const pixelData = {
        x: x,
        y: y,
        color: currentColorChoice,
        date: new Date().toISOString(),
    };
    
    /*const pixelRef = db.collection('pixels').doc(`${pixel.x}-${pixel.y}`);
    const pixelRefData = db.collection('pixelsData').doc(`${pixel.x}+${pixel.y}+${new Date().toISOString()}`);
    pixelRef.set(pixel, {merge: true});
    pixelRefData.set(pixelData, {merge: false});*/

    const { error } = await supabase.from('pixels').insert([{ x, y, color: currentColorChoice, date: new Date().toISOString() }]);
    if (error) console.error('Erreur lors de l\'insertion:', error);
}

game.addEventListener('mousemove', function(event){
    const x = Math.floor(event.pageX / gridCellSize) * gridCellSize;
    const y = Math.floor(event.pageY / gridCellSize) * gridCellSize;

    createPixel(x, y, currentColorChoice);
    test(x,y,currentColorChoice);
    

    cursor.style.left = x + 'px';
    cursor.style.top = y + 'px';
})


/*db.collection('pixels').onSnapshot(function(querySnapshot) {
    querySnapshot.docChanges().forEach(function(change) {
        if (change.type === "added") {
            const pixel = change.doc.data();
            createPixel(pixel.x, pixel.y, pixel.color);
        }
    });
});*/

async function fetchAllPixels() {
    let allPixels = [];
    let start = 0;
    let step = 1000;
    let hasMore = true;

    while (hasMore) {
        const { data, error } = await supabase
            .from("pixels")
            .select("*")
            .range(start, start + step - 1);

        if (error) {
            console.error("Erreur lors de la récupération des pixels:", error);
            return;
        }

        allPixels = allPixels.concat(data);
        start += step;

        if (data.length < step) hasMore = false; // Arrête si moins de 1000 pixels reçus
    }

    console.log(`Nombre total de pixels récupérés: ${allPixels.length}`);

    allPixels.forEach(pixel => {
        ctx.fillStyle = pixel.color;
        ctx.fillRect(pixel.x, pixel.y, gridCellSize, gridCellSize);
    });
}
fetchAllPixels();

function subscribeToPixels() {
    const channel = supabase
        .channel('realtime_pixels')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pixels' }, payload => {
            const newPixel = payload.new;
            console.log('Nouveau pixel reçu en temps réel:', newPixel);
            
            // Ajouter le pixel au canvas
            ctx.fillStyle = newPixel.color;
            ctx.fillRect(newPixel.x, newPixel.y, gridCellSize, gridCellSize);
        })
        .subscribe();

    return channel;
}

subscribeToPixels();