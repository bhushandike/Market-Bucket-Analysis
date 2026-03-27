import pandas as pd
import numpy as np
import io
import matplotlib.pyplot as plt
import networkx as nx
import seaborn as sns
from mlxtend.frequent_patterns import apriori, association_rules
from flask import Flask, jsonify, send_file, request
from flask_cors import CORS
from mlxtend.preprocessing import TransactionEncoder

# --- CRITICAL FIX: SET NON-GUI BACKEND for stability ---
import matplotlib
matplotlib.use('Agg')

# ------------------------------------------------------
# Initialize App
# ------------------------------------------------------
app = Flask(__name__)
CORS(app)

# --- Global Variables for MBA Data ---
rules = pd.DataFrame()
item_counts = pd.Series()
total_transactions = 0
df = pd.DataFrame()
frequent_itemsets = pd.DataFrame()

# --- 1. DATA PROCESSING AND MBA SETUP (Runs once on startup) ---
def setup_data():
    global rules, item_counts, total_transactions, df, frequent_itemsets
    
    print("Loading data and running Apriori algorithm...")
    
    try:
        df = pd.read_csv('basket.csv', header=None)
    except FileNotFoundError:
        print("Error: basket.csv not found. Place it in the backend folder.")
        return
    
    df = df.replace(r'^\s*$', np.nan, regex=True)
    total_transactions = len(df)
    
    # Convert to Transactions
    transaction_series = df.stack().reset_index(level=1, drop=True)
    transactions_list = transaction_series.groupby(transaction_series.index).apply(list).tolist()
    te = TransactionEncoder()
    te_ary = te.fit(transactions_list).transform(transactions_list)
    
    # Item Counts
    item_counts = df.stack().value_counts()
    
    # FIX: Set min_support extremely low to guarantee frequent itemsets
    frequent_itemsets = apriori(pd.DataFrame(te_ary, columns=te.columns_), min_support=0.001, use_colnames=True)
    rules = association_rules(frequent_itemsets, metric="confidence", min_threshold=0.01)
    
    # Format rules for JSON and NetworkX
    rules["antecedents_str"] = rules["antecedents"].apply(lambda x: ', '.join(list(x)))
    rules["consequents_str"] = rules["consequents"].apply(lambda x: ', '.join(list(x)))
    
    print(f"Data setup complete. {len(rules)} rules generated.")
    print(f"Total items: {len(item_counts)}")

# --- 2. PLOTTING UTILITIES AND FUNCTIONS ---
def generate_plot_buffer(plot_func, *args, **kwargs):
    """Utility to run a plot function and save the figure to an in-memory PNG buffer"""
    plt.figure()
    buf = io.BytesIO()
    
    try:
        plot_func(*args, **kwargs)
    except Exception as e:
        print(f"--- PLOTTING ERROR: {e} ---")
        plt.clf() 
        plt.figure(figsize=(8, 6))
        plt.text(0.5, 0.5, f"ERROR: {str(e)[:100]}", 
                 fontsize=10, ha='center', va='center', color='red')
        plt.title("Visualization Error")
    
    plt.savefig(buf, format='png', bbox_inches='tight')
    plt.close()
    buf.seek(0)
    return buf

def plot_freq_distribution(item_counts):
    plt.figure(figsize=(10, 5))
    item_counts.head(100).plot(kind='hist', bins=15, color='darkgreen', alpha=0.7)
    plt.title('Item Frequency Distribution (Top 100 Items)')
    plt.xlabel('Frequency')
    plt.ylabel('Count')
    plt.grid(axis='y', alpha=0.5)

def plot_basket_size_distribution(df):
    transaction_sizes = df.count(axis=1)
    plt.figure(figsize=(10, 5))
    plt.hist(transaction_sizes, bins=range(1, 13), align='left', rwidth=0.8, color='purple')
    plt.title('Transaction Size Distribution')
    plt.xlabel('Items per Transaction')
    plt.ylabel('Count')
    plt.xticks(range(1, 13))
    plt.grid(axis='y', alpha=0.5)

def plot_cumulative_coverage(item_counts, total_transactions):
    cumulative_coverage = (item_counts.cumsum() / total_transactions) * 100
    plt.figure(figsize=(10, 5))
    cumulative_coverage.head(50).plot(marker='o', linestyle='-', color='teal')
    plt.axhline(y=80, color='r', linestyle='--', linewidth=1)
    plt.title('Cumulative Coverage')
    plt.xlabel('Top N Items')
    plt.ylabel('Coverage %')
    plt.grid(True, alpha=0.5)

def plot_rules_scatter_standard(rules, lift_threshold):
    filtered_rules = rules[rules['lift'] > lift_threshold]
    if filtered_rules.empty:
        plt.text(0.5, 0.5, f"No rules with Lift > {lift_threshold:.2f}", ha='center')
        return
    plot_rules = filtered_rules.sort_values('lift', ascending=False).head(1000)
    
    plt.figure(figsize=(10, 8))
    scatter = plt.scatter(x=plot_rules['support'], y=plot_rules['confidence'], 
                         c=plot_rules['lift'], cmap='plasma', s=50, alpha=0.6, edgecolors='k')
    plt.colorbar(scatter, label='Lift')
    plt.title(f'Rules Scatter (Lift > {lift_threshold:.2f})')
    plt.xlabel('Support')
    plt.ylabel('Confidence')
    plt.grid(True, alpha=0.5)

def plot_lift_distribution(rules):
    plt.figure(figsize=(10, 5))
    plot_rules = rules.sort_values('lift', ascending=False).head(5000)
    sns.boxplot(y=plot_rules['lift'], color='gold')
    plt.axhline(y=1.0, color='r', linestyle='--')
    plt.title('Lift Distribution')
    plt.ylabel('Lift')
    plt.grid(axis='y', alpha=0.5)

def plot_conf_vs_lift(rules):
    plt.figure(figsize=(10, 8))
    plot_rules = rules.sample(n=min(len(rules), 1000), random_state=42)
    scatter = plt.scatter(x=plot_rules['confidence'], y=plot_rules['lift'], 
                         c=plot_rules['support'], cmap='Reds', 
                         s=plot_rules['support'] * 20000, alpha=0.6)
    plt.colorbar(scatter, label='Support')
    plt.title('Confidence vs Lift')
    plt.xlabel('Confidence')
    plt.ylabel('Lift')
    plt.grid(True, alpha=0.5)

def plot_top_consequents(rules, target_item='whole milk'):
    milk_rules = rules[rules['antecedents_str'].str.contains(target_item, case=False, regex=False)]
    top = milk_rules.sort_values(by='lift', ascending=False).head(10)
    
    if top.empty:
        plt.text(0.5, 0.5, f"No data for '{target_item}'", ha='center')
        return
    
    plt.figure(figsize=(10, 6))
    sns.barplot(x=top['consequents_str'], y=top['lift'], palette='rocket')
    plt.xticks(rotation=45, ha='right')
    plt.title(f"Top Items After '{target_item}'")
    plt.ylabel('Lift')
    plt.grid(axis='y', alpha=0.5)

def plot_top_antecedents(rules, target_item='rolls/buns'):
    buns_rules = rules[rules['consequents_str'].str.contains(target_item, case=False, regex=False)]
    top = buns_rules.sort_values(by='confidence', ascending=False).head(10)
    
    if top.empty:
        plt.text(0.5, 0.5, f"No data for '{target_item}'", ha='center')
        return
    
    plt.figure(figsize=(10, 6))
    sns.barplot(x=top['antecedents_str'], y=top['confidence'], palette='mako')
    plt.xticks(rotation=45, ha='right')
    plt.title(f"Top Predictors of '{target_item}'")
    plt.ylabel('Confidence')
    plt.grid(axis='y', alpha=0.5)

def plot_focused_network(rules, lift_threshold=1.0, top_n=15, focus_items=None):
    np.random.seed(42)
    
    if focus_items:
        filtered = rules[
            rules['antecedents_str'].apply(lambda x: any(i in x for i in focus_items)) | 
            rules['consequents_str'].apply(lambda x: any(i in x for i in focus_items))
        ]
        graph_rules = filtered[filtered['lift'] > lift_threshold].sort_values('lift', ascending=False).head(top_n)
    else:
        graph_rules = rules[rules['lift'] > lift_threshold].sort_values('lift', ascending=False).head(top_n)
    
    if graph_rules.empty:
        plt.text(0.5, 0.5, f"No rules with Lift > {lift_threshold:.2f}", ha='center')
        return
    
    G = nx.DiGraph()
    for _, row in graph_rules.iterrows():
        G.add_edge(row['antecedents_str'], row['consequents_str'], 
                   lift=row['lift'], confidence=row['confidence'])
    
    plt.figure(figsize=(10, 10))
    pos = nx.spring_layout(G, k=0.7, iterations=50, seed=42)
    lifts = [G[u][v]['lift'] for u, v in G.edges()]
    
    nx.draw_networkx_nodes(G, pos, node_size=3500, node_color='lightcoral', alpha=0.9)
    nx.draw_networkx_labels(G, pos, font_size=9, font_weight='bold')
    nx.draw_networkx_edges(G, pos, edge_color=lifts, edge_cmap=plt.cm.Reds, 
                          width=2, arrowsize=20, alpha=0.8)
    plt.title('Network Graph')
    plt.axis('off')

def plot_co_occurrence_matrix(frequent_itemsets, n_items=10):
    pairs = frequent_itemsets[frequent_itemsets['itemsets'].apply(lambda x: len(x) == 2)]
    unique_items = item_counts.head(n_items).index.tolist()
    
    matrix = pd.DataFrame(0.0, index=unique_items, columns=unique_items)
    
    for itemset, support in zip(pairs['itemsets'], pairs['support']):
        items = list(itemset)
        if len(items) == 2:
            i1, i2 = items
            if i1 in unique_items and i2 in unique_items:
                matrix.loc[i1, i2] = support
                matrix.loc[i2, i1] = support
    
    np.fill_diagonal(matrix.values, 0)
    
    plt.figure(figsize=(10, 9))
    sns.heatmap(matrix, annot=True, fmt=".4f", cmap="YlGnBu", linewidths=.5)
    plt.title(f'Co-occurrence Matrix (Top {n_items})')

def plot_clustered_lift_correlation(rules, item_counts, n_antecedents=5, n_consequents=4):
    stable_rules = rules[rules['lift'] >= 1.0]
    single_ant = stable_rules[~stable_rules['antecedents_str'].str.contains(',')]
    top_ants = item_counts.index.intersection(single_ant['antecedents_str'].unique()).tolist()[:n_antecedents]
    
    if not top_ants:
        plt.text(0.5, 0.5, "Not enough data", ha='center')
        return
    
    clustered_data = []
    for ant in top_ants:
        subset = single_ant[single_ant['antecedents_str'] == ant]
        top_cons = subset[subset['consequents_str'] != ant].sort_values('lift', ascending=False).head(n_consequents)
        for _, row in top_cons.iterrows():
            clustered_data.append({
                'Antecedent': ant,
                'Consequent': row['consequents_str'],
                'Lift': row['lift']
            })
    
    df_clustered = pd.DataFrame(clustered_data)
    if df_clustered.empty:
        plt.text(0.5, 0.5, "No data", ha='center')
        return
    
    plt.figure(figsize=(14, 8))
    sns.barplot(x='Lift', y='Antecedent', hue='Consequent', data=df_clustered, palette='viridis')
    plt.axvline(x=1.0, color='red', linestyle='--')
    plt.title('Clustered Lift Correlation')
    plt.xlabel('Lift')
    plt.ylabel('Antecedent')
    plt.legend(title='Consequent', bbox_to_anchor=(1.05, 1))
    plt.tight_layout()

def plot_scatter(rules, lift_threshold):
    plot_rules_scatter_standard(rules, lift_threshold)

def plot_network(rules, lift_threshold, top_n):
    plot_focused_network(rules, lift_threshold, top_n=top_n)

# ==========================================
# API ENDPOINTS
# ==========================================

@app.route('/')
def home():
    return jsonify({
        "status": "running",
        "endpoints": [
            "/api/frequencies",
            "/api/rules_data",
            "/api/available_products",
            "/api/product_consequents",
            "/api/plot/<plot_id>"
        ]
    })

@app.route('/api/frequencies')
def get_frequencies():
    top_10 = item_counts.head(10).reset_index()
    top_10.columns = ['item', 'frequency']
    top_10['percentage'] = (top_10['frequency'] / total_transactions) * 100
    return jsonify(top_10.to_dict('records'))

@app.route('/api/rules_data')
def get_rules_data():
    lift_threshold = float(request.args.get('lift', 1.0))
    filtered = rules[rules['lift'] >= lift_threshold]
    
    if filtered.empty:
        return jsonify([])
    
    data = filtered[['support', 'confidence', 'lift']].head(1000).to_dict('records')
    return jsonify(data)

# ========== NEW ENDPOINTS ==========

@app.route('/api/available_products')
def get_available_products():
    """Get list of top 50 products for autocomplete"""
    try:
        products = item_counts.head(50).index.tolist()
        print(f"Returning {len(products)} products")
        return jsonify(products)
    except Exception as e:
        print(f"Error in available_products: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/product_consequents')
def get_product_consequents():
    """Get top products bought after a given product"""
    try:
        target_item = request.args.get('item', 'whole milk').strip()
        top_n = int(request.args.get('top_n', 10))
        
        print(f"Searching for rules with antecedent: {target_item}")
        
        # Filter rules
        item_rules = rules[rules['antecedents_str'].str.contains(target_item, case=False, regex=False, na=False)]
        
        print(f"Found {len(item_rules)} rules for '{target_item}'")
        
        if item_rules.empty:
            suggestions = item_counts.head(20).index.tolist()
            return jsonify({
                "error": f"No rules found for product: '{target_item}'",
                "suggestions": suggestions
            }), 404
        
        # Get top consequents
        top_consequents = item_rules.sort_values(by='lift', ascending=False).head(top_n)
        
        result = []
        for _, row in top_consequents.iterrows():
            result.append({
                'consequent': row['consequents_str'],
                'lift': round(float(row['lift']), 3),
                'confidence': round(float(row['confidence']), 3),
                'support': round(float(row['support']), 4)
            })
        
        return jsonify({
            "target_item": target_item,
            "data": result,
            "total_rules": len(item_rules)
        })
        
    except Exception as e:
        print(f"Error in product_consequents: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# ====================================

@app.route('/api/plot/<plot_id>')
def get_plot(plot_id):
    lift_threshold = float(request.args.get('lift', 1.0))
    top_n = int(request.args.get('topn', 10))
    
    plot_map = {
        'freq_dist': lambda: plot_freq_distribution(item_counts),
        'basket_size_dist': lambda: plot_basket_size_distribution(df),
        'cumulative_coverage': lambda: plot_cumulative_coverage(item_counts, total_transactions),
        'scatter_standard': lambda: plot_rules_scatter_standard(rules, lift_threshold),
        'lift_dist': lambda: plot_lift_distribution(rules),
        'conf_vs_lift': lambda: plot_conf_vs_lift(rules),
        'top_consequents': lambda: plot_top_consequents(rules),
        'top_antecedents': lambda: plot_top_antecedents(rules),
        'focused_network': lambda: plot_focused_network(rules, lift_threshold),
        'co_occurrence_matrix': lambda: plot_co_occurrence_matrix(frequent_itemsets),
        'clustered_lift': lambda: plot_clustered_lift_correlation(rules, item_counts),
        'rules_scatter': lambda: plot_scatter(rules, lift_threshold),
        'rules_network': lambda: plot_network(rules, lift_threshold, top_n),
    }
    
    plot_func = plot_map.get(plot_id)
    if not plot_func:
        return jsonify({"error": f"Plot '{plot_id}' not found"}), 404
    
    buffer = generate_plot_buffer(plot_func)
    return send_file(buffer, mimetype='image/png')

# ==========================================
# MAIN EXECUTION
# ==========================================

if __name__ == '__main__':
    print("=" * 50)
    print("Starting Market Basket Analysis Server")
    print("=" * 50)
    setup_data()
    print("\nServer starting on http://127.0.0.1:5001")
    print("Available endpoints:")
    print("  - /api/frequencies")
    print("  - /api/available_products  [NEW]")
    print("  - /api/product_consequents [NEW]")
    print("=" * 50)
    app.run(debug=True, port=5001, use_reloader=False)