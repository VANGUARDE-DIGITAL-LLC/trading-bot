// Replace these with the keys from your Supabase Project Settings
const SUPABASE_URL = 'https://your-project-url.supabase.co';
const SUPABASE_KEY = 'your-anon-public-key';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let state = {
    budget: 5000.00,
    currentStock: { symbol: '', price: 0 }
};

const budgetEl = document.getElementById('budget-amount');
const tradeForm = document.getElementById('trade-form');

// 2. NEW: FETCH TRADES FROM DATABASE
// This ensures that even if you refresh, your "available budget" is calculated
async function syncPortfolio() {
    const { data, error } = await supabase
        .from('trades')
        .select('*');

    if (error) console.error('Error fetching data:', error);
    
    // Calculate budget based on trade history
    let spent = 0;
    data.forEach(trade => {
        if (trade.type === 'buy') spent += (trade.amount * trade.price);
        if (trade.type === 'sell') spent -= (trade.amount * trade.price);
    });
    
    state.budget = 5000.00 - spent;
    budgetEl.textContent = `$${state.budget.toLocaleString()}`;
}

// 3. MODIFIED: EXECUTE TRADE & SAVE TO SUPABASE
tradeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const qty = parseFloat(document.getElementById('quantity').value);
    const type = document.getElementById('trade-type').value;
    const price = parseFloat(state.currentStock.price);

    if (price === 0) return alert("Search for a stock first!");

    // UI Feedback: Disable button while saving
    tradeForm.classList.add('loading');

   /*-- // INSERT DATA INTO SUPABASE
    const { data, error } = await supabase
        .from('trades')
        .insert([
            { 
                symbol: state.currentStock.symbol, 
                amount: qty, 
                type: type, 
                price: price 
            }
        ]);--*/

    // Ensure this matches your Supabase table name exactly!
    const { data, error } = await supabase
    .from('Stock Tracker') 
    .insert([
        { 
            symbol: state.currentStock.symbol, 
            amount: qty, 
            type: type, 
            price: state.currentStock.price 
        }
    ]);

    tradeForm.classList.remove('loading');

    if (error) {
        alert("Trade failed: " + error.message);
    } else {
        alert(`Successfully recorded ${type} for ${state.currentStock.symbol}`);
        syncPortfolio(); // Refresh the budget display
    }
});

// Run sync on load
syncPortfolio();

// ... (Keep your existing Search and Trend logic from the previous file)
