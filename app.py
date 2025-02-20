from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit
import time
import random

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

grid_state = [["#f8f8ff"] * 64 for _ in range(36)]
cooldowns = {}
cooldown_time = 5000 # in ms

def is_cooldown_over(token):
    curr_time = time.perf_counter()
    prev_time = cooldowns[token]
    print(curr_time - prev_time)
    return (curr_time - prev_time) * 1000 >= cooldown_time

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/check-cooldown")
def handle_check_cooldown():
    resp = jsonify(success=True)
    return resp


@socketio.on("click_cell")
def handle_click(data):
    """Handles a cell click, updates state, and broadcasts update."""
    real_ip = request.headers.get('X-Real-IP')
    forwarded_for = request.headers.get('X-Forwarded-For')
    user_agent = request.headers.get('User-Agent')

    # Log the headers or do something with them
    print(f"X-Real-IP: {real_ip}")
    print(f"X-Forwarded-For: {forwarded_for}")
    print(f"User-Agent: {user_agent}")
    
    row, col, color, token = data["row"], data["col"], data["color"], data["token"]
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
