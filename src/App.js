import React, { useState, useEffect, useMemo } from 'react';
import { Bar, Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './index.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const API_BASE_URL = 'http://127.0.0.1:5001';

// COMPLETE PRODUCT LIST - Hardcoded from dataset
const PRODUCT_LIST = [
  "Instant food products",
  "UHT-milk",
  "abrasive cleaner",
  "artif. sweetener",
  "baby cosmetics",
  "bags",
  "baking powder",
  "bathroom cleaner",
  "beef",
  "berries",
  "beverages",
  "bottled beer",
  "bottled water",
  "brandy",
  "brown bread",
  "butter",
  "butter milk",
  "cake bar",
  "candles",
  "candy",
  "canned beer",
  "canned fish",
  "canned vegetables",
  "cat food",
  "cereals",
  "chewing gum",
  "chicken",
  "chocolate",
  "citrus fruit",
  "cleaner",
  "cling film/bags",
  "coffee",
  "condensed milk",
  "cooking chocolate",
  "cookware",
  "cream cheese",
  "curd",
  "curd cheese",
  "decalcifier",
  "dental care",
  "dessert",
  "detergent",
  "dish cleaner",
  "dishes",
  "dog food",
  "domestic eggs",
  "female sanitary products",
  "finished products",
  "fish",
  "flour",
  "flower (seeds)",
  "flower soil/fertilizer",
  "frankfurter",
  "frozen fish",
  "frozen meals",
  "frozen potato products",
  "frozen vegetables",
  "fruit/vegetable juice",
  "grapes",
  "hair spray",
  "hand soap",
  "hardware",
  "herbs",
  "honey",
  "house keeping products",
  "hygiene articles",
  "ice cream",
  "instant coffee",
  "jam",
  "ketchup",
  "kitchen towels",
  "kraut",
  "liquor",
  "liqueur",
  "long life bakery product",
  "make up remover",
  "male cosmetics",
  "margarine",
  "mayonnaise",
  "meat",
  "meat spreads",
  "misc. beverages",
  "mustard",
  "napkins",
  "newspapers",
  "nut snack",
  "nuts/prunes",
  "oil",
  "onions",
  "organic products",
  "other vegetables",
  "packaged fruit/vegetables",
  "pasta",
  "pastry",
  "pet care",
  "photo/film",
  "pickled vegetables",
  "pip fruit",
  "popcorn",
  "pork",
  "pot plants",
  "potted plants",
  "prepared fish",
  "prepared vegetables",
  "preservation products",
  "processed cheese",
  "pudding powder",
  "ready soups",
  "red/blush wine",
  "rice",
  "roll products",
  "rolls/buns",
  "root vegetables",
  "rubbing alcohol",
  "salad dressing",
  "salt",
  "salty snack",
  "sauces",
  "sausage",
  "seasonal products",
  "semi-finished bread",
  "shopping bags",
  "skin care",
  "sliced cheese",
  "snack products",
  "soap",
  "soda",
  "softener",
  "specialty bar",
  "specialty cheese",
  "specialty chocolate",
  "specialty fat",
  "specialty vegetables",
  "spices",
  "spread cheese",
  "sugar",
  "sweet spreads",
  "syrup",
  "tea",
  "tidbits",
  "toilet cleaner",
  "toiletry",
  "tooth paste",
  "tropical fruit",
  "turkey",
  "vinegar",
  "waffles",
  "whipped/sour cream",
  "whisky",
  "white bread",
  "white wine",
  "whole milk",
  "yogurt",
  "zwieback"
];

function App() {
  // State Management
  const [plotChoice, setPlotChoice] = useState('relative_frequency_data');
  const [liftThreshold, setLiftThreshold] = useState(1.0);
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const [frequencyData, setFrequencyData] = useState([]);
  const [rulesData, setRulesData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Product Recommendation Feature States
  const [productName, setProductName] = useState('whole milk');
  const [consequentsData, setConsequentsData] = useState([]);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter products based on search term
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return PRODUCT_LIST;
    return PRODUCT_LIST.filter(product => 
      product.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // MEMOIZED API MAPPING
  const API_MAP = useMemo(() => ({
    'relative_frequency_data': '/api/frequencies',
    'interactive_scatter': `/api/rules_data?lift=${liftThreshold}`,
    'product_consequents': `/api/product_consequents?item=${encodeURIComponent(productName)}&top_n=10`,
    'freq_dist': `/api/plot/freq_dist`,
    'basket_size_dist': `/api/plot/basket_size_dist`,
    'cumulative_coverage': `/api/plot/cumulative_coverage`,
    'scatter_standard': `/api/plot/scatter_standard?lift=${liftThreshold}`,
    'lift_dist': `/api/plot/lift_dist`,
    'conf_vs_lift': `/api/plot/conf_vs_lift`,
    'top_consequents': `/api/plot/top_consequents`,
    'top_antecedents': `/api/plot/top_antecedents`,
    'focused_network': `/api/plot/focused_network?lift=${liftThreshold}`,
    'co_occurrence_matrix': `/api/plot/co_occurrence_matrix`,
    'clustered_lift': `/api/plot/clustered_lift`,
    'rules_network': `/api/plot/rules_network?lift=${liftThreshold}&topn=10`,
    'rules_scatter': `/api/plot/rules_scatter?lift=${liftThreshold}`,
  }), [liftThreshold, productName]);

  // Main Data Fetching Logic
  useEffect(() => {
    setLoading(true);
    setImageDataUrl(null);
    setFrequencyData([]);
    setRulesData([]);
    setConsequentsData([]);

    const endpoint = API_MAP[plotChoice];

    if (!endpoint) {
      console.error(`No endpoint found for plotChoice: ${plotChoice}`);
      setLoading(false);
      return;
    }

    // 1. Frequency Data
    if (plotChoice === 'relative_frequency_data') {
      fetch(API_BASE_URL + endpoint)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        })
        .then(data => {
          setFrequencyData(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching frequency data:", err);
          setLoading(false);
        });
    } 
    // 2. Product Consequents
    else if (plotChoice === 'product_consequents') {
      fetch(API_BASE_URL + endpoint)
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            alert(`Error: ${data.error}\n\nTry one of these products:\n${data.suggestions?.slice(0, 10).join(', ')}`);
            setLoading(false);
            return;
          }
          setConsequentsData(data.data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching consequents:", err);
          alert("Failed to fetch product recommendations. Check console for details.");
          setLoading(false);
        });
    } 
    // 3. Interactive Scatter
    else if (plotChoice === 'interactive_scatter') {
      fetch(API_BASE_URL + endpoint)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        })
        .then(data => {
          if (data.error) {
            alert(`Server Error: ${data.error}`);
            setLoading(false);
            return;
          }
          setRulesData(data);
          setLoading(false);
        })
        .catch(err => { 
          console.error("Error fetching rules data:", err); 
          setLoading(false); 
        });
    } 
    // 4. All other plots (images)
    else {
      fetch(API_BASE_URL + endpoint)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.blob();
        }) 
        .then(blob => {
          const url = URL.createObjectURL(blob);
          setImageDataUrl(url);
          setLoading(false);
        })
        .catch(err => {
          console.error(`Error fetching plot ${plotChoice}:`, err);
          setLoading(false);
        });
    }
  }, [plotChoice, liftThreshold, productName, API_MAP]);

  // MEMOIZED Chart Configurations
  const chartData = useMemo(() => ({
    labels: frequencyData.map(item => item.item),
    datasets: [
      {
        label: 'Market Penetration (%)',
        data: frequencyData.map(item => parseFloat(item.percentage.toFixed(2))),
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1,
      },
    ],
  }), [frequencyData]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Top 10 Items by Market Penetration (Relative Frequency)' },
    },
    scales: {
      x: { title: { display: true, text: 'Percentage of Transactions (%)' }, min: 0 },
    }
  }), []);

  const scatterData = useMemo(() => ({
    datasets: [{
      label: `Rules (Lift ≥ ${liftThreshold})`,
      data: rulesData.map(rule => ({ x: rule.support, y: rule.confidence, lift: rule.lift })),
      backgroundColor: rulesData.map(rule => {
        const liftRatio = Math.min(1, (rule.lift - 1) / 1.5);
        const hue = (1 - liftRatio) * 120;
        return `hsl(${hue}, 80%, 50%)`;
      }),
      pointRadius: 6,
      pointHoverRadius: 8,
    }],
  }), [rulesData, liftThreshold]);

  const scatterOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Interactive Rule Scatter Plot (Color by Lift)' },
      tooltip: {
        callbacks: {
          label: function(context) {
            const point = context.raw;
            return `Lift: ${point.lift.toFixed(2)} | Support: ${point.x.toFixed(4)} | Confidence: ${point.y.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      x: { type: 'linear', position: 'bottom', title: { display: true, text: 'Support' } },
      y: { beginAtZero: false, title: { display: true, text: 'Confidence' } }
    },
  }), []);

  const consequentsChartData = useMemo(() => ({
    labels: consequentsData.map(item => item.consequent),
    datasets: [
      {
        label: 'Lift Score',
        data: consequentsData.map(item => item.lift),
        backgroundColor: consequentsData.map(item => {
          if (item.lift >= 2.0) return 'rgba(255, 99, 132, 0.8)';
          if (item.lift >= 1.5) return 'rgba(255, 159, 64, 0.8)';
          if (item.lift >= 1.0) return 'rgba(75, 192, 192, 0.8)';
          return 'rgba(201, 203, 207, 0.8)';
        }),
        borderColor: 'rgba(0, 0, 0, 0.3)',
        borderWidth: 1,
      },
    ],
  }), [consequentsData]);

  const consequentsChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      title: { 
        display: true, 
        text: `Top Products Bought After: "${productName}"`,
        font: { size: 16, weight: 'bold' }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const item = consequentsData[context.dataIndex];
            return [
              `Lift: ${item.lift}`,
              `Confidence: ${(item.confidence * 100).toFixed(1)}%`,
              `Support: ${(item.support * 100).toFixed(2)}%`
            ];
          }
        }
      }
    },
    scales: {
      x: { 
        title: { display: true, text: 'Lift (Association Strength)' },
        min: 0,
        grid: { color: 'rgba(0, 0, 0, 0.1)' }
      },
      y: {
        ticks: { 
          autoSkip: false,
          font: { size: 11 }
        }
      }
    },
  }), [consequentsData, productName]);

  // Visualization Rendering
  const renderVisualization = () => {
    if (loading) return <div className="loading-state">⏳ Loading Visualization...</div>;

    if (plotChoice === 'product_consequents') {
      if (consequentsData.length === 0) {
        return (
          <div className="no-data-state">
            <p>❌ No recommendations found for "{productName}"</p>
            <p style={{ fontSize: '14px', marginTop: '10px', color: '#666' }}>
              💡 Try selecting a different product from the dropdown
            </p>
          </div>
        );
      }
      return (
        <div style={{ width: '95%', margin: '0 auto' }}>
          <div style={{ height: '600px', marginBottom: '20px' }}>
            <Bar data={consequentsChartData} options={consequentsChartOptions} />
          </div>
          
          {/* INTERPRETATION GUIDE */}
          <div className="interpretation-guide">
            <h3 className="guide-title">
              <span className="guide-icon">📊</span>
              Interpretation Guide
            </h3>
            <div className="guide-grid">
              <div className="guide-item lift-high">
                <div className="guide-color-box">🔴</div>
                <div className="guide-content">
                  <strong>Lift &gt; 2.0</strong>
                  <p>Very strong association - excellent cross-sell opportunity</p>
                </div>
              </div>
              
              <div className="guide-item lift-medium-high">
                <div className="guide-color-box">🟠</div>
                <div className="guide-content">
                  <strong>Lift 1.5-2.0</strong>
                  <p>Strong association - good recommendation</p>
                </div>
              </div>
              
              <div className="guide-item lift-medium">
                <div className="guide-color-box">🔵</div>
                <div className="guide-content">
                  <strong>Lift 1.0-1.5</strong>
                  <p>Moderate association - consider for promotions</p>
                </div>
              </div>
              
              <div className="guide-item lift-low">
                <div className="guide-color-box">⚪</div>
                <div className="guide-content">
                  <strong>Lift &lt; 1.0</strong>
                  <p>Weak/negative association - avoid bundling</p>
                </div>
              </div>
            </div>
            
            <div className="guide-footer">
              <strong>💡 Business Insights:</strong>
              <ul>
                <li>Place high-lift products near each other in store</li>
                <li>Create bundle offers for items with lift &gt; 1.5</li>
                <li>Use for personalized product recommendations</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    if (plotChoice === 'interactive_scatter') {
      if (rulesData.length === 0) {
        return <div className="no-data-state">No rules found with Lift ≥ {liftThreshold}.</div>;
      }
      return (
        <div style={{ width: '90%', height: '600px' }}>
          <Scatter data={scatterData} options={scatterOptions} />
        </div>
      );
    }

    if (plotChoice === 'relative_frequency_data' && frequencyData.length > 0) {
      return (
        <div style={{ width: '90%', height: '500px' }}>
          <Bar data={chartData} options={chartOptions} />
        </div>
      );
    }

    if (imageDataUrl) {
      return (
        <img 
          src={imageDataUrl} 
          alt={`Visualization: ${plotChoice}`} 
          className="plot-image"
        />
      );
    }

    return <div className="no-data-state">Select a visualization to begin.</div>;
  };

  // Product selector dropdown handler
  const handleProductChange = (e) => {
    const value = e.target.value;
    if (value === 'custom') {
      setShowCustomInput(true);
      setProductName('');
    } else if (value) {
      setShowCustomInput(false);
      setProductName(value);
    }
  };

  // App Return Statement
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🛒 Market Basket Analysis Dashboard</h1>
        <p className="app-subtitle">
          Discover product associations and optimize cross-selling strategies
        </p>
      </header>

      <div className="controls-panel">
        <label htmlFor="plot-selector" className="control-label">
          Choose Visualization:
        </label>
        
        <select 
          id="plot-selector" 
          value={plotChoice} 
          onChange={(e) => setPlotChoice(e.target.value)}
          className="select-input"
        >
            <optgroup label="🎯 Product Recommendations (NEW!)">
              <option value="product_consequents">★ Products Bought AFTER (Custom Product)</option>
            </optgroup>

            <optgroup label="📊 Item Popularity & Distribution">
              <option value="relative_frequency_data">1. Item Frequency Bar Chart</option>
              <option value="basket_size_dist">2. Transaction Size Distribution</option>
              <option value="cumulative_coverage">3. Cumulative Coverage (Pareto)</option>
            </optgroup>

            <optgroup label="📈 Rule Quality & Metrics">
              <option value="interactive_scatter">4. Support vs Confidence (Interactive)</option>
              <option value="conf_vs_lift">5. Confidence vs Lift (Interactive)</option>
              <option value="lift_dist">6. Rule Lift Distribution</option>
            </optgroup>
            
            <optgroup label="🔬 Advanced Rule Analysis">
              <option value="clustered_lift">7. Clustered Lift Correlation</option>
              <option value="rules_network">8. Association Rules Network</option>
              <option value="focused_network">9. Focused Network Graph</option>
              <option value="co_occurrence_matrix">10. Item Co-occurrence Matrix</option>
            </optgroup>
            
            <optgroup label="🎁 Targeted Recommendations">
              <option value="top_consequents">11. Top Items Bought AFTER Milk</option>
              <option value="top_antecedents">12. Top Items That Predict Buns</option>
            </optgroup>

            <optgroup label="🔧 Compatibility Plots">
              <option value="scatter_standard">13. Scatter Plot (Legacy PNG)</option>
            </optgroup>
        </select>
        
        {/* IMPROVED PRODUCT SELECTOR WITH SEARCH */}
        {plotChoice === 'product_consequents' && (
          <div className="product-selector-container">
            <label className="control-label">
              🔍 Select Product ({PRODUCT_LIST.length} available):
            </label>
            
            {/* Search Box */}
            <input
              type="text"
              className="product-search-input"
              placeholder="🔎 Search products... (e.g., milk, bread, coffee)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <div className="product-input-group">
              <select 
                className="product-dropdown"
                value={showCustomInput ? 'custom' : productName}
                onChange={handleProductChange}
                size="1"
              >
                <option value="">-- Select a Product ({filteredProducts.length} shown) --</option>
                {filteredProducts.map((product, idx) => (
                  <option key={idx} value={product}>{product}</option>
                ))}
                <option value="custom">✏️ Enter Custom Product Name...</option>
              </select>
              
              {showCustomInput && (
                <div className="custom-input-wrapper">
                  <input
                    type="text"
                    className="custom-product-input"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Type exact product name..."
                    autoFocus
                  />
                  <button 
                    className="btn-close-custom"
                    onClick={() => {
                      setShowCustomInput(false);
                      setProductName('whole milk');
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
            
            <div className="product-info-box">
              <strong>📦 Currently analyzing:</strong> 
              <span className="current-product">{productName || 'None selected'}</span>
              {searchTerm && (
                <div className="search-results-info">
                  🔍 Showing {filteredProducts.length} of {PRODUCT_LIST.length} products
                </div>
              )}
              <div className="popular-products">
                💡 Popular items: whole milk • other vegetables • rolls/buns • soda • yogurt
              </div>
            </div>
          </div>
        )}
        
        {/* Lift Threshold Slider */}
        {(plotChoice.includes('scatter') || plotChoice.includes('network') || plotChoice.includes('interactive')) && (
          <div className="lift-control">
            <label className="control-label">
              Min Lift Threshold: <span className="threshold-value">{liftThreshold.toFixed(1)}</span>
            </label>
            <input
              type="range"
              min="0.0"
              max="3.0"
              step="0.1"
              value={liftThreshold}
              onChange={(e) => setLiftThreshold(parseFloat(e.target.value))}
              className="slider"
            />
            <div className="slider-labels">
              <span>0.0</span>
              <span>1.5</span>
              <span>3.0</span>
            </div>
          </div>
        )}
      </div>

      <main className="visualization-panel">
        {renderVisualization()}
      </main>

      <footer className="app-footer">
        <p>Market Basket Analysis Dashboard | Powered by Apriori Algorithm & React</p>
      </footer>
    </div>
  );
}

export default App;