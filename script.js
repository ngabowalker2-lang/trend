// ========== ADVANCED TRADING DASHBOARD WITH COLOR THEME ==========
// Features: Real-time prices, Chart.js, Trading History, Portfolio Tracking

// Global state
let portfolio = {
  balance: 10000,
  positions: {
    BTC: 0,
    ETH: 0,
    AAPL: 0
  },
  trades: []
};

let currentPrices = {
  BTC: 62450,
  ETH: 3245.50,
  AAPL: 187.32
};

let priceChart = null;
let portfolioChart = null;
let chartData = {
  labels: [],
  prices: []
};

let winStreak = 0;
let lastTradeWasWin = true;

// ========== API INTEGRATION ==========
async function fetchCryptoPrices() {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd');
    if (response.ok) {
      const data = await response.json();
      if (data.bitcoin) currentPrices.BTC = data.bitcoin.usd;
      if (data.ethereum) currentPrices.ETH = data.ethereum.usd;
    }
  } catch (error) {
    console.log('Using simulated prices');
  }
  
  // Simulate AAPL movement
  const change = (Math.random() - 0.5) * 3;
  currentPrices.AAPL = Math.max(170, Math.min(200, currentPrices.AAPL + change));
  
  updatePriceDisplays();
}

// ========== UI UPDATES ==========
function updatePriceDisplays() {
  const btcChange = ((currentPrices.BTC - 62450) / 62450 * 100).toFixed(2);
  const ethChange = ((currentPrices.ETH - 3245.5) / 3245.5 * 100).toFixed(2);
  const aaplChange = ((currentPrices.AAPL - 187.32) / 187.32 * 100).toFixed(2);
  
  document.getElementById('btcPrice').innerHTML = `$${currentPrices.BTC.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  document.getElementById('ethPrice').innerHTML = `$${currentPrices.ETH.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  document.getElementById('aaplPrice').innerHTML = `$${currentPrices.AAPL.toFixed(2)}`;
  
  document.getElementById('btcChange').innerHTML = `${parseFloat(btcChange) >= 0 ? '+' : ''}${btcChange}%`;
  document.getElementById('ethChange').innerHTML = `${parseFloat(ethChange) >= 0 ? '+' : ''}${ethChange}%`;
  document.getElementById('aaplChange').innerHTML = `${parseFloat(aaplChange) >= 0 ? '+' : ''}${aaplChange}%`;
  
  document.getElementById('btcChange').className = `stat-change ${parseFloat(btcChange) >= 0 ? 'positive' : 'negative'}`;
  document.getElementById('ethChange').className = `stat-change ${parseFloat(ethChange) >= 0 ? 'positive' : 'negative'}`;
  document.getElementById('aaplChange').className = `stat-change ${parseFloat(aaplChange) >= 0 ? 'positive' : 'negative'}`;
  
  document.getElementById('tradePrice').innerHTML = `$${getCurrentAssetPrice().toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  document.getElementById('portfolioValue').innerHTML = `$${calculatePortfolioValue().toFixed(2)}`;
  document.getElementById('availableBalance').innerHTML = `$${portfolio.balance.toFixed(2)}`;
  
  // Random volume
  const volume = (Math.random() * 50 + 100).toFixed(1);
  document.getElementById('totalVolume').innerHTML = `$${volume}B`;
}

function getCurrentAssetPrice() {
  const activeAsset = document.querySelector('.asset-option.active')?.getAttribute('data-asset') || 'BTC';
  return currentPrices[activeAsset];
}

function calculatePortfolioValue() {
  let value = portfolio.balance;
  value += portfolio.positions.BTC * currentPrices.BTC;
  value += portfolio.positions.ETH * currentPrices.ETH;
  value += portfolio.positions.AAPL * currentPrices.AAPL;
  return value;
}

// ========== CHART.JS INTEGRATION ==========
function initializeChart() {
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    chartData.labels.push(date.toLocaleDateString());
    const basePrice = currentPrices.BTC;
    const variation = (Math.random() - 0.5) * 0.08;
    chartData.prices.push(basePrice * (1 + variation));
  }
  
  const ctx = document.getElementById('priceChart').getContext('2d');
  priceChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartData.labels,
      datasets: [{
        label: 'BTC/USD',
        data: chartData.prices,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#fff',
        pointRadius: 5,
        pointHoverRadius: 8,
        pointStyle: 'circle'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { labels: { color: '#eef5ff', font: { size: 12 } } },
        tooltip: { mode: 'index', intersect: false, backgroundColor: 'rgba(15, 25, 45, 0.9)', titleColor: '#60a5fa' }
      },
      scales: {
        y: { grid: { color: 'rgba(59, 130, 246, 0.1)' }, ticks: { color: '#eef5ff' } },
        x: { grid: { color: 'rgba(59, 130, 246, 0.1)' }, ticks: { color: '#eef5ff' } }
      }
    }
  });
}

function updateChart(newPrice) {
  if (!priceChart) return;
  const newDate = new Date().toLocaleDateString();
  priceChart.data.labels.push(newDate);
  priceChart.data.datasets[0].data.push(newPrice);
  if (priceChart.data.labels.length > 7) {
    priceChart.data.labels.shift();
    priceChart.data.datasets[0].data.shift();
  }
  priceChart.update();
}

// ========== PORTFOLIO CHART ==========
function updatePortfolioChart() {
  const ctx = document.getElementById('portfolioChart').getContext('2d');
  const portfolioValues = [
    portfolio.positions.BTC * currentPrices.BTC,
    portfolio.positions.ETH * currentPrices.ETH,
    portfolio.positions.AAPL * currentPrices.AAPL,
    portfolio.balance
  ];
  
  if (portfolioChart) portfolioChart.destroy();
  
  portfolioChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Bitcoin', 'Ethereum', 'Apple', 'Cash'],
      datasets: [{
        data: portfolioValues,
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
        borderWidth: 0,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: '#eef5ff', font: { size: 12 } } },
        tooltip: { callbacks: { label: (context) => `$${context.raw.toFixed(2)}` } }
      }
    }
  });
}

// ========== RECOMMENDATION ENGINE ==========
function generateRecommendations() {
  const bullishSignals = [
    { icon: "🚀", title: "Strong Buy Alert", desc: "BTC breaking resistance at $63k. Massive volume incoming.", color: "blue" },
    { icon: "📊", title: "Golden Cross Forming", desc: "ETH 50MA crossing above 200MA - bullish signal.", color: "green" },
    { icon: "💎", title: "Accumulation Zone", desc: "AAPL near strong support - institutional buying detected.", color: "yellow" },
    { icon: "🔥", title: "DeFi Summer 2.0", desc: "Layer 2 solutions showing +40% TVL growth.", color: "blue" },
    { icon: "⚡", title: "Momentum Spike", desc: "RSI indicates strong upward trajectory continuing.", color: "green" }
  ];
  
  const randomSignals = [...bullishSignals].sort(() => 0.5 - Math.random()).slice(0, 3);
  
  const recList = document.getElementById('recommendationList');
  recList.innerHTML = randomSignals.map(rec => `
    <div class="rec-item" style="border-left-color: var(--${rec.color}-primary)">
      <div class="rec-icon">${rec.icon}</div>
      <div class="rec-text">
        <div class="rec-title">${rec.title}</div>
        <div class="rec-sub">${rec.desc}</div>
      </div>
      <div class="badge-score" style="background: linear-gradient(135deg, var(--${rec.color}-primary), var(--${rec.color}-dark));">AI ⚡</div>
    </div>
  `).join('');
}

// ========== TRADING ENGINE ==========
function executeTrade(type) {
  const asset = document.querySelector('.asset-option.active')?.getAttribute('data-asset') || 'BTC';
  const amount = parseFloat(document.getElementById('tradeAmount').value);
  const price = currentPrices[asset];
  
  if (isNaN(amount) || amount <= 0) {
    showFeedback('Please enter a valid amount', 'error');
    return;
  }
  
  if (type === 'buy') {
    const totalCost = amount;
    if (totalCost > portfolio.balance) {
      showFeedback('Insufficient balance!', 'error');
      return;
    }
    
    const units = amount / price;
    portfolio.positions[asset] += units;
    portfolio.balance -= totalCost;
    
    portfolio.trades.unshift({
      date: new Date().toLocaleString(),
      asset: asset,
      type: 'BUY',
      amount: units.toFixed(5),
      price: price.toFixed(2),
      total: totalCost
    });
    
    showFeedback(`✅ Successfully bought ${units.toFixed(5)} ${asset} at $${price.toFixed(2)}`, 'success');
    updateStreak(true);
  } else {
    const units = amount / price;
    if (portfolio.positions[asset] < units) {
      showFeedback('Insufficient holdings!', 'error');
      return;
    }
    
    const totalReceived = amount;
    portfolio.positions[asset] -= units;
    portfolio.balance += totalReceived;
    
    const profit = totalReceived - amount;
    const isProfitable = profit > 0;
    
    portfolio.trades.unshift({
      date: new Date().toLocaleString(),
      asset: asset,
      type: 'SELL',
      amount: units.toFixed(5),
      price: price.toFixed(2),
      total: totalReceived,
      profit: profit.toFixed(2)
    });
    
    showFeedback(`📉 Sold ${units.toFixed(5)} ${asset} at $${price.toFixed(2)}. ${isProfitable ? 'Profit!' : ''}`, 'info');
    updateStreak(isProfitable);
  }
  
  updatePortfolioChart();
  updatePriceDisplays();
  updateAnalytics();
  renderHistory();
}

function updateStreak(isWin) {
  if (isWin) {
    if (lastTradeWasWin) {
      winStreak++;
    } else {
      winStreak = 1;
      lastTradeWasWin = true;
    }
  } else {
    winStreak = 0;
    lastTradeWasWin = false;
  }
  document.getElementById('streakCount').innerHTML = winStreak;
}

function showFeedback(message, type) {
  const feedbackDiv = document.getElementById('tradeFeedback');
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  feedbackDiv.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i> ${message}`;
  feedbackDiv.style.background = type === 'success' ? 'rgba(16, 185, 129, 0.2)' : type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)';
  
  setTimeout(() => {
    feedbackDiv.innerHTML = '<i class="fas fa-chart-line"></i> Ready for next trade';
    feedbackDiv.style.background = 'rgba(0, 0, 0, 0.3)';
  }, 3000);
}

// ========== HISTORY RENDERING ==========
function renderHistory(filter = 'all') {
  const tbody = document.getElementById('historyList');
  let filteredTrades = portfolio.trades;
  
  if (filter === 'buy') filteredTrades = portfolio.trades.filter(t => t.type === 'BUY');
  if (filter === 'sell') filteredTrades = portfolio.trades.filter(t => t.type === 'SELL');
  
  if (filteredTrades.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="no-data">No trades yet</td></tr>';
    return;
  }
  
  tbody.innerHTML = filteredTrades.map(trade => `
    <tr>
      <td>${trade.date}</td>
      <td><strong>${trade.asset}</strong></td>
      <td class="${trade.type === 'BUY' ? 'buy-type' : 'sell-type'}">${trade.type}</td>
      <td>${trade.amount}</td>
      <td>$${trade.price}</td>
      <td>$${parseFloat(trade.total).toFixed(2)}</td>
    </tr>
  `).join('');
}

// ========== ANALYTICS UPDATE ==========
function updateAnalytics() {
  const totalTrades = portfolio.trades.length;
  const buyTrades = portfolio.trades.filter(t => t.type === 'BUY').length;
  const sellTrades = portfolio.trades.filter(t => t.type === 'SELL').length;
  
  let winningTrades = 0;
  let totalProfit = 0;
  let bestTrade = 0;
  
  portfolio.trades.forEach(trade => {
    if (trade.profit) {
      const profit = parseFloat(trade.profit);
      totalProfit += profit;
      if (profit > bestTrade) bestTrade = profit;
      if (profit > 0) winningTrades++;
    }
  });
  
  const winRate = sellTrades > 0 ? ((winningTrades / sellTrades) * 100).toFixed(1) : 0;
  
  document.getElementById('totalTrades').innerHTML = totalTrades;
  document.getElementById('winRate').innerHTML = `${winRate}%`;
  document.getElementById('profitLoss').innerHTML = `$${totalProfit.toFixed(2)}`;
  document.getElementById('profitLoss').style.color = totalProfit >= 0 ? '#10b981' : '#ef4444';
  document.getElementById('bestTrade').innerHTML = bestTrade > 0 ? `$${bestTrade.toFixed(2)}` : '-';
}

// ========== EVENT HANDLERS ==========
function initAssetSelector() {
  const options = document.querySelectorAll('.asset-option');
  options.forEach(opt => {
    opt.addEventListener('click', () => {
      options.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      updatePriceDisplays();
      showFeedback(`Switched to ${opt.getAttribute('data-asset')}`, 'info');
    });
  });
}

function initFilterButtons() {
  const filters = document.querySelectorAll('.filter-btn');
  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderHistory(btn.getAttribute('data-filter'));
    });
  });
}

function initPageNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const pages = document.querySelectorAll('.page');
  const pageTitle = document.getElementById('pageTitle');
  
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const pageId = item.getAttribute('data-page');
      
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      
      pages.forEach(page => page.classList.remove('active'));
      document.getElementById(`${pageId}Page`).classList.add('active');
      
      const titles = { dashboard: 'Dashboard', trade: 'Trade', history: 'History', analytics: 'Analytics' };
      pageTitle.innerHTML = titles[pageId];
      
      if (pageId === 'analytics') updateAnalytics();
      if (pageId === 'history') renderHistory();
    });
  });
}

function initQuickAmounts() {
  const quickBtns = document.querySelectorAll('.quick-amount');
  quickBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const amount = btn.getAttribute('data-amount');
      document.getElementById('tradeAmount').value = amount;
    });
  });
}

// ========== LIVE SIMULATION ==========
function startLiveSimulation() {
  setInterval(async () => {
    await fetchCryptoPrices();
    const currentPrice = currentPrices.BTC;
    updateChart(currentPrice);
    updatePortfolioChart();
    generateRecommendations();
    updatePriceDisplays();
    
    // Random sentiment update
    const sentiment = Math.floor(Math.random() * 30 + 60);
    document.querySelector('.sentiment-fill').style.width = `${sentiment}%`;
    document.querySelector('.fgi-fill').style.width = `${sentiment}%`;
    document.querySelector('.fgi-value').innerHTML = `${sentiment} - ${sentiment > 70 ? 'Greed' : sentiment > 40 ? 'Neutral' : 'Fear'}`;
    document.querySelector('.fgi-value').className = `fgi-value ${sentiment > 60 ? 'greed' : ''}`;
  }, 10000);
}

// ========== INITIALIZATION ==========
async function init() {
  await fetchCryptoPrices();
  initializeChart();
  updatePortfolioChart();
  generateRecommendations();
  initAssetSelector();
  initFilterButtons();
  initPageNavigation();
  initQuickAmounts();
  startLiveSimulation();
  updatePriceDisplays();
  
  // Bind trade buttons
  document.getElementById('buyBtn').addEventListener('click', () => executeTrade('buy'));
  document.getElementById('sellBtn').addEventListener('click', () => executeTrade('sell'));
  document.getElementById('refreshData').addEventListener('click', async () => {
    await fetchCryptoPrices();
    showFeedback('Data refreshed!', 'success');
  });
}

init();