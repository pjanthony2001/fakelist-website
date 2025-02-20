from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit
import time
import random

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

grid_state = [["#f8f8ff"] * 64 for _ in range(36)]
cooldowns = {}
cooldown_time = 5000 # in ms
error = 10 # in ms



@app.route("/")
def index():
    return render_template("index.html")

@app.route("/check-cooldown")
def handle_check_cooldown():
    
    real_ip = request.headers.get('X-Real-IP')
    curr_time = time.perf_counter()
    if real_ip in cooldowns:
        prev_time = cooldowns[real_ip]
    if (curr_time - prev_time) * 1000 < cooldown_time + error: 
        return jsonify(success=False)
        
    return jsonify(success=True)


@socketio.on("click_cell")
def handle_click(data):
    """Handles a cell click, updates state, and broadcasts update."""
    real_ip = request.headers.get('X-Real-IP')
    forwarded_for = request.headers.get('X-Forwarded-For')
    user_agent = request.headers.get('User-Agent')
    
    curr_time = time.perf_counter()
    if real_ip in cooldowns:
        prev_time = cooldowns[real_ip]
        if (curr_time - prev_time) * 1000 < cooldown_time: 
            return 
        
    cooldowns[real_ip] = curr_time
    
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
