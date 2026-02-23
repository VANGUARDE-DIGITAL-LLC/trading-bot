// Mock Data for Testing
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

// Initialize
function init() {
    budgetEl.textContent = `$${state.budget.toLocaleString()}`;
}

// 1. Review Stock Price
searchBtn.addEventListener('click', () => {
    const symbol = tickerInput.value.toUpperCase();
    if (!symbol) return alert("Please enter a symbol");
    
    // Simulate API Fetch
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

// 3 & 4. Budget Check and Trade Execution
tradeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const qty = document.getElementById('quantity').value;
    const type = document.getElementById('trade-type').value;
    const totalCost = qty * state.currentStock.price;

    if (state.currentStock.price === 0) {
        alert("Please search for a stock first.");
        return;
    }

    if (type === 'buy') {
        if (totalCost > state.budget) {
            alert("Insufficient funds for this long-term trade.");
        } else {
            state.budget -= totalCost;
            alert(`Success! Purchased ${qty} shares of ${state.currentStock.symbol}`);
        }
    } else {
        state.budget += Number(totalCost);
        alert(`Sold ${qty} shares of ${state.currentStock.symbol}`);
    }

    budgetEl.textContent = `$${state.budget.toLocaleString()}`;
});

init();
