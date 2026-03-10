// 1. INITIALIZE SUPABASE
const SUPABASE_URL = 'https://khgpbkcmjmajiclhwgix.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZ3Bia2Ntam1hamljbGh3Z2l4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NzgzMjIsImV4cCI6MjA4ODA1NDMyMn0.72R1rX_XXtjTwf4XEpPVaWFDpwLoNuIQGRvDBDDNSBU';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let state = {
    budget: 5000.00,
    currentStock: { symbol: '', price: 0 },
    trends: {
        '10': 'Upward trend detected based on 10-day Moving Average.',
        '15': 'Market stability confirmed over 15-day research period.',
        '30': 'Strong long-term growth signal for high-yield assets.'
    }
};

// UI Elements
const budgetEl = document.getElementById('budget-amount');
const tickerInput = document.getElementById('ticker-input');
const searchBtn = document.getElementById('search-btn');
const trendContent = document.getElementById('trend-content');
const tradeForm = document.getElementById('trade-form');

// DIAGNOSTIC: Check connection
async function checkDatabaseConnection() {
    console.log("Checking Supabase connection...");
    try {
        const { data, error } = await _supabase.from('Trading_BData_Table').select('id').limit(1);
        if (error) {
            console.error("❌ Connection Error:", error.message);
        } else {
            console.log("✅ Successfully connected to Trading_BData_Table!");
        }
    } catch (err) {
        console.error("❌ Network Error:", err);
    }
}

// Read from Trading_BData_Table
async function syncPortfolio() {
    console.log("Syncing portfolio data...");
    const { data, error } = await _supabase
        .from('Trading_BData_Table')
        .select('*');

    if (error) {
        console.error('❌ Sync Error:', error.message);
        return;
    }
    
    let spent = 0;
    data.forEach(trade => {
        // Using bracket notation for hyphenated column names from your screenshot
        const price = trade['current-price'] || 0;
        spent += price; 
    });
    
    state.budget = 5000.00 - spent;
    budgetEl.textContent = `$${state.budget.toLocaleString()}`;
}

// Initialize
function init() {
    checkDatabaseConnection();
    syncPortfolio(); 
}

// 1. Review Stock Price
searchBtn.addEventListener('click', () => {
    const symbol = tickerInput.value.toUpperCase();
    if (!symbol) return alert("Please enter a symbol");
    
    state.currentStock.symbol = symbol;
    state.currentStock.price = (Math.random() * (200 - 50) + 50).toFixed(2);
    
    document.getElementById('stock-symbol').textContent = state.currentStock.symbol;
    document.getElementById('current-price').textContent = `$${state.currentStock.price}`;
});

// 2. Trend Analysis
document.querySelectorAll('.trend-tab').forEach(button => {
    button.addEventListener('click', (e) => {
        const days = e.target.getAttribute('data-days');
        trendContent.innerHTML = `<strong>${days}-Day Analysis:</strong> <p>${state.trends[days]}</p>`;
    });
});

// 3 & 4. Write to Trading_BData_Table
tradeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const qty = document.getElementById('quantity').value;
    const price = parseFloat(state.currentStock.price);

    if (price === 0) {
        alert("Please search for a stock first.");
        return;
    }

    // Insert into Supabase using '_supabase'
    const { error } = await _supabase
        .from('Trading_BData_Table')
        .insert([
            { 
                'stock-symbol': state.currentStock.symbol, 
                'current-price': price 
            }
        ]);

    if (error) {
        console.error("❌ Insert Error:", error.message);
        alert("Database Error: " + error.message);
    } else {
        alert(`Success! Recorded ${state.currentStock.symbol} in your portfolio.`);
        syncPortfolio(); 
    }
});

init();
