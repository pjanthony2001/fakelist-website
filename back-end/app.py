from flask import Flask, request, jsonify

app = Flask(__name__)

# GET request - Just returns a message
@app.route('/get', methods=['GET'])
def get_request():
    client_ip = request.remote_addr
    data = request.get_json()
    
    return jsonify({"message": "This is a GET request"})

# POST request - Accepts JSON data and returns it
@app.route('/post', methods=['POST'])
def post_request():
    data = request.get_json()
    return jsonify({"received_data": data})

if __name__ == '__main__':
    app.run(debug=True)
