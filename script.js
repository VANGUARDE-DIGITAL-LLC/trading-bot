// Replace these with the keys from your Supabase Project Settings
const SUPABASE_URL = 'https://huulaazgkcypjctntntn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_3NHwfCSfNR_DXxzQjVR5aw_Wz3wIrK5';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
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

// NEW FUNCTION: Read from Trading_BData_Table
async function syncPortfolio() {
    const { data, error } = await supabase
        .from('Trading_BData_Table')
        .select('*');

    if (error) {
        console.error('Error fetching data:', error);
        return;
    }
    
    // Calculate current budget based on trades in the DB
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
    syncPortfolio(); // Fetch latest data from Supabase on load
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

// 3 & 4. UPDATED: Write to Trading_BData_Table
tradeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const qty = document.getElementById('quantity').value;
    const type = document.getElementById('trade-type').value;
    const price = parseFloat(state.currentStock.price);
    const totalCost = qty * price;

    if (price === 0) {
        alert("Please search for a stock first.");
        return;
    }

    if (type === 'buy' && totalCost > state.budget) {
        alert("Insufficient funds for this long-term trade.");
        return;
    }

    // Insert into Supabase using your exact column headings
    const { error } = await supabase
        .from('Trading_BData_Table')
        .insert([
            { 
                'stock-symbol': state.currentStock.symbol, 
                'current-price': price 
            }
        ]);

    if (error) {
        alert("Database Error: " + error.message);
    } else {
        alert(`Success! Recorded ${state.currentStock.symbol} in your portfolio.`);
        syncPortfolio(); // Refresh budget after successful trade
    }
});

init();
