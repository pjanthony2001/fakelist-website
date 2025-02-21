from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit
import time
import csv

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

grid_state = [["#f8f8ff"] * 80 for _ in range(54)]
cooldowns = {}
cooldown_time = 5000 # in ms
error = 100 # in ms
csv_file_path = 'data.csv'
batch_size = 100

batch_data = []





# Function to write data to CSV file
def write_to_csv(data):
    with open(csv_file_path, mode='a', newline='') as file:
        writer = csv.writer(file)
        for row in data:
            writer.writerow(row)


@app.route("/")
def index():
    return render_template("index.html")

@app.route("/check-cooldown/")
def handle_check_cooldown():
    real_ip = request.headers.get('X-Real-IP')
    curr_time = time.perf_counter()
    response = {"cooldownOver" : True}

    if real_ip in cooldowns:
        prev_time = cooldowns[real_ip]
        if (curr_time - prev_time) * 1000 < cooldown_time:
            response = {"cooldownOver" : False}

    return jsonify(response), 200


@socketio.on("click_cell")
def handle_click(data):
    global batch_data
    real_ip = request.headers.get('X-Real-IP')
    
    curr_time = time.perf_counter()
    if real_ip in cooldowns:
        prev_time = cooldowns[real_ip]
        if (curr_time - prev_time) * 1000 < cooldown_time + error: 
            return 
        
    cooldowns[real_ip] = curr_time
    
    row, col, color = data["row"], data["col"], data["color"]
    row, col = int(row), int(col)
    grid_state[row][col] = color
    
    batch_data.append([real_ip, curr_time, row, col, color]) 
    if len(batch_data) >= batch_size:
        write_to_csv(batch_data)
        batch_data = []

    # Broadcast updated grid to all clients
    socketio.emit("update_grid", {"grid": grid_state})

@socketio.on("connect")
def send_initial_grid():
    """Send the current grid state when a client connects."""
    emit("update_grid", {"grid": grid_state})

if __name__ == "__main__":
    print("Here")
    socketio.run(app, host="0.0.0.0", port=5000)
