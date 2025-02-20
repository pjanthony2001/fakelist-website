from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

grid_state = [["#f8f8ff"] * 64 for _ in range(32)]

@app.route("/")
def index():
    return render_template("index.html")

@socketio.on("click_cell")
def handle_click(data):
    """Handles a cell click, updates state, and broadcasts update."""
    row, col, color = data["row"], data["col"], data["color"]
    row, col = int(row), int(col) 
    grid_state[row][col] = color

    # Broadcast updated grid to all clients
    socketio.emit("update_grid", {"grid": grid_state})

@socketio.on("connect")
def send_initial_grid():
    """Send the current grid state when a client connects."""
    emit("update_grid", {"grid": grid_state})

if __name__ == "__main__":
    print("Here")
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
