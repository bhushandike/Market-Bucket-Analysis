# 🛒 Market Basket Analysis

A data mining project that applies the Apriori algorithm to retail transaction data to discover co-purchase patterns and generate actionable association rules. Built with a Python backend and a React.js interactive dashboard.

> 🎓 **Big Data Analytics Lab (CSL7012) Mini Project** — Department of Computer Engineering, A. P. Shah Institute of Technology, University of Mumbai (2025–26)

---

## 📌 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Screenshots](#-screenshots)
- [Tech Stack](#️-tech-stack)
- [Algorithm Details](#️-algorithm-details)
- [Key Metrics](#-key-metrics)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#️-usage)
- [Results](#-results)
- [Troubleshooting](#-troubleshooting)
- [Future Scope](#-future-scope)
- [Contributing](#-contributing)
- [References](#-references)
- [Team](#-team)
- [License](#-license)

---

## 📖 About

Market Basket Analysis (MBA) is a widely used technique in retail analytics to uncover which items are frequently bought together. These insights drive strategies such as product bundling, cross-selling, store layout optimization, and recommendation systems.

This project applies the Apriori algorithm to a retail transaction dataset to:

- Identify frequent itemsets from transactional data
- Generate association rules based on support and confidence thresholds
- Visualize findings through an interactive web dashboard
- Derive actionable business insights for marketing and product placement

---

## ✨ Features

| Feature | Description |
|---|---|
| 📊 Item Frequency Bar Chart | Shows top 10 items by market penetration (relative frequency) |
| 📦 Transaction Size Distribution | Histogram of items per transaction across the dataset |
| 📈 Cumulative Coverage (Pareto) | Pareto chart showing cumulative item coverage |
| 🕸️ Network Graph | Interactive network visualization of product association rules |
| 🔍 Product Search & Analysis | Search any product (154 available) to see top co-purchased items |
| 📋 Rule Details on Hover | Hover over bars to see Lift, Confidence, and Support values |
| 🎯 Configurable Thresholds | Adjustable support and confidence parameters for rule generation |

---

## 📸 Screenshots

**Market Basket Analysis Dashboard**
Main dashboard with item frequency bar chart showing top products by market penetration.

**Transaction Size Distribution**
Histogram showing the distribution of items per transaction across the dataset.

**Cumulative Coverage (Pareto Chart)**
Pareto analysis of top items showing cumulative coverage percentage.

**Network Graph**
Interactive network graph visualizing product association rules and relationships.

**Product-Specific Analysis**
Search and analyze co-purchase patterns for any specific product (e.g., rolls/buns, whole milk).

---

## 🛠️ Tech Stack

### Frontend

- **React.js** — Interactive dashboard UI
- **Chart.js / D3.js** — Data visualizations and network graphs

### Backend

- **Python 3.11**
- **Flask** — API server

### Key Python Libraries

| Library | Purpose |
|---|---|
| `mlxtend` | Apriori algorithm and association rule mining |
| `pandas` | Data preprocessing and manipulation |
| `numpy` | Numerical computations |
| `matplotlib` | Data visualization and plotting |
| `seaborn` | Statistical graphics |
| `flask` | REST API for serving data to frontend |
| `networkx` | Network graph generation |

### Dataset

- Transactional data from a retail/supermarket environment
- Each record represents a basket of items purchased by a customer
- 154 unique products across thousands of transactions

---

## ⚙️ Algorithm Details

### Apriori Algorithm — Working Principle

The Apriori algorithm operates on the principle that all non-empty subsets of a frequent itemset must also be frequent, allowing efficient pruning of candidate itemsets.

**Step-by-step process:**

```text
Step 1: Generate Candidate Itemsets
   └── Identify all individual items and calculate frequency
   └── Keep items meeting minimum support threshold

Step 2: Prune Infrequent Itemsets
   └── Remove itemsets below minimum support
   └── Reduces combinations for next iteration

Step 3: Generate Larger Itemsets
   └── Combine frequent itemsets to form (k+1) size sets
   └── Evaluate new itemsets for frequency

Step 4: Repeat
   └── Continue generating and pruning iteratively
   └── Stop when no more frequent itemsets can be formed

Step 5: Generate Association Rules
   └── Derive rules satisfying minimum confidence level
   └── Rules show how items influence purchase of others

Step 6: Evaluate Rules
   └── Assess using Support, Confidence, and Lift
```

### Advantages

- Simple and easy to implement
- Provides interpretable results suitable for business decision-making
- Helps identify strong associations among frequently purchased products

---

## 📏 Key Metrics

| Metric | Formula | Description |
|---|---|---|
| Support | P(A ∩ B) | How often an itemset appears in all transactions |
| Confidence | P(B\|A) = Support(A∩B) / Support(A) | Likelihood of purchasing item B when item A is purchased |
| Lift | Confidence(A→B) / Support(B) | Strength of a rule over random chance (Lift > 1 = positive association) |

---

## 🚀 Installation

### Prerequisites

- Python 3.11+
- Node.js & npm

### Clone the Repository

```bash
git clone https://github.com/bhushandike/Market-Bucket-Analysis-.git
cd Market-Bucket-Analysis-
```

### Backend Setup (Python)

```bash
# Create and activate virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate        # Linux/macOS
venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt
```

### Frontend Setup

```bash
cd frontend
npm install
```

---

## 🔧 Configuration

The Apriori algorithm can be tuned using the following parameters:

| Parameter | Default | Description |
|---|---|---|
| `min_support` | `0.002` | Minimum fraction of transactions an itemset must appear in. Lower values find rarer but potentially useful rules. |
| `min_confidence` | `0.5` | Minimum conditional probability for a rule to be retained. Higher values yield stronger, more reliable rules. |
| `min_lift` | `1.0` | Minimum lift threshold. Values greater than 1 indicate a positive association beyond random chance. |

> **Tip:** Start with the defaults and gradually lower `min_support` if too few rules are generated, or raise `min_confidence` to filter out weaker associations.

---

## ▶️ Usage

### Start the Backend

```bash
python app.py
```

### Start the Frontend

```bash
cd frontend
npm start
```

The dashboard will be available at `http://localhost:3000`.

### How to Use

1. Open the Market Basket Analysis Dashboard
2. Use the **"Choose Visualization"** dropdown to select:
   - Item Frequency Bar Chart
   - Transaction Size Distribution
   - Cumulative Coverage (Pareto)
   - Network Graph
3. Use the **Product Search** to select any of 154 products
4. View top co-purchased products with Lift, Confidence, and Support on hover
5. Analyze the network graph for visual product relationships

---

## 📊 Results

Running Apriori with thresholds (support = 0.002, confidence = 0.5):

| Rule | Support | Confidence | Lift |
|---|---|---|---|
| {Bread} → {Butter} | 0.025 | 0.60 | 1.25 |
| {Milk, Bread} → {Eggs} | 0.012 | 0.55 | 1.40 |

### Business Insights

- High lift rules (above 1) indicate positive associations beyond random chance
- Use discovered rules to design bundling offers, cross-promotions, or co-located shelf layouts
- Focus on moderately frequent but high-lift rules for the most actionable insights
- Prune redundant rules that don't add additional information
- Top frequently purchased items: whole milk, other vegetables, rolls/buns, soda, yogurt

---

## 🩺 Troubleshooting

### Common Issues

**`ModuleNotFoundError` when running `python app.py`**

Ensure the virtual environment is activated and dependencies are installed:

```bash
source venv/bin/activate   # Linux/macOS
pip install -r requirements.txt
```

**Frontend fails to connect to the backend**

Make sure the Flask backend is running before starting the React frontend. The backend defaults to `http://localhost:5000` — verify this matches the API URL configured in the frontend.

**`npm install` fails with permission errors**

Try running with administrator privileges or use a Node version manager such as [nvm](https://github.com/nvm-sh/nvm):

```bash
nvm use 18
npm install
```

**Too few association rules generated**

Lower the `min_support` threshold (e.g., from `0.002` to `0.001`) or reduce `min_confidence`. See the [Configuration](#-configuration) section for details.

**Python version mismatch**

This project requires Python 3.11+. Check your version with:

```bash
python --version
```

---

## 🔮 Future Scope

- 🧠 **FP-Growth Algorithm** — Implement faster alternative for large-scale datasets
- 📱 **Real-time Analysis** — Process live POS transaction data for dynamic recommendations
- 🤖 **ML-based Recommendations** — Combine association rules with collaborative filtering
- ☁️ **Cloud Deployment** — Deploy on AWS/GCP for scalable enterprise use
- 🌐 **Multi-store Analysis** — Compare basket patterns across different store locations
- 📈 **Time-based Patterns** — Analyze seasonal and temporal purchasing trends
- 🔗 **E-commerce Integration** — Real-time product recommendation engine for online stores

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit them: `git commit -m "Add your feature"`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Open a Pull Request describing your changes

Please ensure your code follows the existing style and that any new features are documented.

---

## 📚 References

1. Hossain & Sattar — "Market Basket Analysis Using Apriori and FP Growth Algorithm" — Compares algorithms in real datasets.
2. Marina Kholod & Nikita Mokrenko, 2024 — "Market Basket Analysis Using Rule-Based Algorithms and Data Mining Techniques" — Newer work on rule mining frameworks.
3. Chen et al., 2024 — "Incremental high average-utility itemset mining: survey and challenges" — Surveys advanced utility-based and incremental methods.
4. MDPI, 2025 — "Alternative Support Threshold Computation for Market Basket Analysis" — Discusses dynamic support threshold strategies.
5. Omol et al., 2024 — "Apriori Algorithm and Market Basket Analysis to Uncover Consumer Buying Patterns: Case of a Kenyan Supermarket"
6. Peslak & Menon, 2024 — "Leveraging Market Basket Analysis for Enhanced Understanding of Social Media Platform Usage" — Demonstrates MBA outside traditional retail.

---

## 👥 Team

| Name | Roll No. |
|---|---|
| Utkarsh Jawale | 22102161 |
| Bhushan Dike | 22102157 |

**Guide:** Prof. Deepali Kayande

**Institution:** A. P. Shah Institute of Technology, Thane — University of Mumbai

---

## 📄 License

This project is for academic purposes. Feel free to fork and extend it.

---

*Made with ❤️ for Big Data Analytics Lab | A. P. Shah Institute of Technology*
