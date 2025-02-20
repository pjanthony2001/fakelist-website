from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

# Define a 5x5 grid (0 means uncolored, 1 means colored)
GRID_SIZE = 5
grid_state = [[0] * GRID_SIZE for _ in range(GRID_SIZE)]

@app.route("/")
def index():
    return render_template("index.html")

@socketio.on("click_cell")
def handle_click(data):
    """Handles a cell click, updates state, and broadcasts update."""
    row, col = data["row"], data["col"]
    
    # Toggle cell color (0 → 1, 1 → 0)
    grid_state[row][col] = 1 if grid_state[row][col] == 0 else 0

    # Broadcast updated grid to all clients
    socketio.emit("update_grid", {"grid": grid_state})

@socketio.on("connect")
def send_initial_grid():
    """Send the current grid state when a client connects."""
    emit("update_grid", {"grid": grid_state})

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000)
