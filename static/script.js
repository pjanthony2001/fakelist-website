const colorsChoice = document.querySelector('#colorsChoice');
const cooldownSquare = document.createElement('div'); 
cooldownSquare.id = 'cooldownSquare';

const colorList = [
    "#ff5a5f", "#ff784f", "#ffd166", "#ff4d94",  // Chaudes
    "#007bff", "#00b4d8", "#28a745", "#80ed99",  // Froidesthe 
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

var socket = io(); // Connect WebSocket

// Add click event listeners to static grid cells
document.querySelectorAll(".cell").forEach(cell => {
    cell.addEventListener("click", () => {
        let row = cell.dataset.row;
        let col = cell.dataset.col;
        socket.emit("click_cell", { row: row, col: col, color: currentColorChoice});  // Send click event
    });
});

// Listen for grid updates from the server
socket.on("update_grid", function(data) {
    let gridData = data.grid;
    document.querySelectorAll(".cell").forEach(cell => {
        let row = cell.dataset.row;
        let col = cell.dataset.col;
        cell.style.backgroundColor = gridData[row][col]
    });
});