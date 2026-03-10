// 1. INITIALIZE SUPABASE
const SUPABASE_URL = 'https://khgpbkcmjmajiclhwgix.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZ3Bia2Ntam1hamljbGh3Z2l4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NzgzMjIsImV4cCI6MjA4ODA1NDMyMn0.72R1rX_XXtjTwf4XEpPVaWFDpwLoNuIQGRvDBDDNSBU';
//const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// FIX: Using 'db' prevents the naming conflict with the 'supabase' library
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let state = {
    budget: 5000.00,
    currentStock: { symbol: '', price: 0 },
    trends: {
        '10': 'Upward trend detected based on 10-day Moving Average.',
        '15': 'Market stability confirmed over 15-day research period.',
        '30': 'Strong long-term growth signal for high-yield assets.'
    }
};

const budgetEl = document.getElementById('budget-amount');
const tickerInput = document.getElementById('ticker-input');
const searchBtn = document.getElementById('search-btn');
const trendContent = document.getElementById('trend-content');
const tradeForm = document.getElementById('trade-form');

// Function to calculate budget based on trade history
async function syncPortfolio() {
    const { data, error } = await db.from('symbol').select('*');
    if (error) {
        console.error('❌ Sync Error:', error.message);
        return;
    }
    
    let spent = 0;
    data.forEach(trade => {
        const total = trade.amount * trade.price;
        if (trade.type === 'buy') spent += total;
        if (trade.type === 'sell') spent -= total;
    });
    
    state.budget = 5000.00 - spent;
    budgetEl.textContent = `$${state.budget.toLocaleString()}`;
}

// Search Function
searchBtn.addEventListener('click', () => {
    const symbol = tickerInput.value.toUpperCase();
    if (!symbol) return alert("Please enter a symbol");
    
    state.currentStock.symbol = symbol;
    state.currentStock.price = (Math.random() * (200 - 50) + 50).toFixed(2);
    
    document.getElementById('stock-symbol').textContent = state.currentStock.symbol;
    document.getElementById('current-price').textContent = `$${state.currentStock.price}`;
});

// Buy/Sell Function
tradeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const qty = parseFloat(document.getElementById('quantity').value);
    const type = document.getElementById('trade-type').value;
    const price = parseFloat(state.currentStock.price);
    const totalCost = qty * price;

    if (price === 0) return alert("Search for a stock first!");
    if (type === 'buy' && totalCost > state.budget) return alert("Insufficient funds!");

    // Write to 'symbol' table using your schema columns
    const { error } = await db
        .from('symbol')
        .insert([
            { 
                symbol: state.currentStock.symbol, 
                amount: qty, 
                type: type, 
                price: price 
            }
        ]);

    if (error) {
        alert("Database Error: " + error.message);
    } else {
        alert(`Successfully recorded ${type} order for ${state.currentStock.symbol}`);
        syncPortfolio(); // Automatically updates the budget on the screen
    }
});

syncPortfolio(); // Run on load
