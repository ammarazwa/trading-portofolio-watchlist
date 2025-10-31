const WATCHLIST_KEY = 'userWatchlist';
let watchlistStocks = JSON.parse(localStorage.getItem(WATCHLIST_KEY)) || ['AAPL', 'GOOG', 'TSLA'];
const watchlistEl = document.getElementById('watchlist');
const refreshButton = document.getElementById('refresh-button');

const mockApiData = {
    'AAPL': 150.00,
    'GOOG': 2750.00,
    'TSLA': 850.00,
    'AMZN': 3200.00,
    'MSFT': 280.00
};

function saveWatchlist() {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlistStocks));
}

async function fetchStockPrice(symbol) {
    if (Math.random() < 0.1) {
        throw new Error(`API call for ${symbol} failed: Connection timeout.`);
    }

    const currentPrice = mockApiData[symbol] || 100.00;
    const change = (Math.random() - 0.5) * 5;
    const newPrice = Math.round((currentPrice + change) * 100) / 100;
    mockApiData[symbol] = newPrice;
    
    return { 
        symbol: symbol,
        price: newPrice.toFixed(2), 
        change: change.toFixed(2)
    };
}

function updateStockDisplay(symbol, newPrice, change) {
    const priceEl = document.getElementById(`price-${symbol}`);
    const changeEl = document.getElementById(`change-${symbol}`);

    if (priceEl && changeEl) {
        priceEl.textContent = `$${newPrice}`;
        changeEl.textContent = `(${change > 0 ? '+' : ''}${change})`;
        
        changeEl.classList.remove('price-up', 'price-down');
        priceEl.classList.remove('price-up', 'price-down');

        if (change > 0) {
            priceEl.classList.add('price-up');
            changeEl.classList.add('price-up');
        } else if (change < 0) {
            priceEl.classList.add('price-down');
            changeEl.classList.add('price-down');
        }
    }
}

async function updateAllStockPrices() {
    const marketTicker = document.getElementById('market-ticker');
    marketTicker.textContent = 'Memperbarui harga...';
    refreshButton.disabled = true;

    for (const symbol of watchlistStocks) {
        try {
            const data = await fetchStockPrice(symbol);
            updateStockDisplay(symbol, data.price, data.change);
        } catch (error) {
            console.error(`Dynamic update failed for ${symbol}:`, error.message);
            const priceEl = document.getElementById(`price-${symbol}`);
            if (priceEl) {
                priceEl.textContent = 'Error Data';
                priceEl.classList.add('price-down');
            }
        }
    }
    marketTicker.textContent = `Harga terakhir diperbarui: ${new Date().toLocaleTimeString()}`;
    refreshButton.disabled = false;
}

function deleteStock(symbolToDelete) {
    watchlistStocks = watchlistStocks.filter(symbol => symbol !== symbolToDelete);
    saveWatchlist();
    renderWatchlist();
}

async function renderWatchlist() {
    watchlistEl.innerHTML = '';
    
    for (const symbol of watchlistStocks) {
        const listItem = document.createElement('li');
        listItem.dataset.symbol = symbol;
        
        listItem.innerHTML = `
            <span>${symbol}</span>
            <div class="price-container">
                <span id="price-${symbol}">...loading...</span>
                <span id="change-${symbol}"></span>
                <button class="delete-button" data-symbol="${symbol}">Hapus</button>
            </div>
        `;
        watchlistEl.appendChild(listItem);

        try {
            const data = await fetchStockPrice(symbol);
            updateStockDisplay(symbol, data.price, data.change);
        } catch (error) {
            console.error(`Error initial fetch for ${symbol}:`, error.message);
            const priceEl = document.getElementById(`price-${symbol}`);
            const changeEl = document.getElementById(`change-${symbol}`);
            if (priceEl) {
                priceEl.textContent = 'Data error';
                priceEl.classList.add('price-down');
                if (changeEl) changeEl.textContent = '';
            }
        }
    }
}

function setupEventListeners() {
    document.getElementById('add-stock-form').addEventListener('submit', function(event) {
        event.preventDefault();
        const input = document.getElementById('stock-symbol-input');
        const newSymbol = input.value.trim().toUpperCase();

        if (newSymbol && !watchlistStocks.includes(newSymbol)) {
            watchlistStocks.push(newSymbol);
            saveWatchlist();
            renderWatchlist();
            input.value = '';
        } else if (newSymbol) {
            alert(`Simbol ${newSymbol} sudah ada di Watchlist.`);
        }
    });

    watchlistEl.addEventListener('click', function(event) {
        if (event.target.classList.contains('delete-button')) {
            const symbolToDelete = event.target.dataset.symbol;
            if (confirm(`Yakin ingin menghapus ${symbolToDelete} dari watchlist?`)) {
                deleteStock(symbolToDelete);
            }
        }
    });
    
    refreshButton.addEventListener('click', updateAllStockPrices);
}

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    renderWatchlist();
    setInterval(updateAllStockPrices, 15000);
});