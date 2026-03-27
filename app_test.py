from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Test data
test_products = ['whole milk', 'yogurt', 'soda', 'rolls/buns', 'other vegetables']

@app.route('/')
def home():
    return jsonify({"status": "working", "message": "Server is running!"})

@app.route('/api/available_products')
def get_available_products():
    print("✓ available_products endpoint called")
    return jsonify(test_products)

@app.route('/api/product_consequents')
def get_product_consequents():
    print("✓ product_consequents endpoint called")
    return jsonify({
        "target_item": "whole milk",
        "data": [
            {"consequent": "yogurt", "lift": 2.5, "confidence": 0.6, "support": 0.05},
            {"consequent": "butter", "lift": 2.0, "confidence": 0.5, "support": 0.04}
        ],
        "total_rules": 2
    })

if __name__ == '__main__':
    print("\n" + "="*50)
    print("TEST SERVER STARTING")
    print("="*50)
    print("\nTest these URLs in your browser:")
    print("  http://127.0.0.1:5001/")
    print("  http://127.0.0.1:5001/api/available_products")
    print("  http://127.0.0.1:5001/api/product_consequents")
    print("\n" + "="*50 + "\n")
    
    app.run(debug=True, port=5001, use_reloader=False)