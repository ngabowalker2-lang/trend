// ========== PROFESSIONAL TRADING DASHBOARD ==========
// Enterprise-grade trading platform with real-time features

// State Management
let portfolio = {
  balance: 10000,
  positions: { BTC: 0, ETH: 0, AAPL: 0 },
  trades: []
};

let currentPrices = {
  BTC: 62450,
  ETH: 3245.50,
  AAPL: 187.32
};

let charts = { price: null, portfolio: null, activity: null };
let winStreak = 0;
let lastTradeWin = true;

// ========== API INTEGRATION ==========
async function fetchMarketData() {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd');
    if (response.ok) {
      const data = await response.json();
      if (data.bitcoin) currentPrices.BTC = data.bitcoin.usd;
      if (data.ethereum) currentPrices.ETH = data.ethereum.usd;
    }
  } catch (error) {
    console.debug('Using simulated data');
  }
  
  // Simulate AAPL movement
  currentPrices.AAPL += (Math.random() - 0.5) * 2.5;
  currentPrices.AAPL = Math.max(170, Math.min(200, currentPrices.AAPL));
  
  updateAllDisplays();
}

// ========== UI UPDATES ==========
function updateAllDisplays() {
  updatePriceCards();
  updatePortfolioValue();
  updateTradePanel();
  updatePositionsList();
  if (charts.price) updateChart();
}

function updatePriceCards() {
  const btcChange = ((currentPrices.BTC - 62450) / 62450 * 100).toFixed(2);
  const ethChange = ((currentPrices.ETH - 3245.5) / 3245.5 * 100).toFixed(2);
  const aaplChange = ((currentPrices.AAPL - 187.32) / 187.32 * 100).toFixed(2);
  
  document.getElementById('btcPrice').innerHTML = `$${currentPrices.BTC.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
  document.getElementById('ethPrice').innerHTML = `$${currentPrices.ETH.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
  document.getElementById('aaplPrice').innerHTML = `$${currentPrices.AAPL.toFixed(2)}`;
  
  updateChangeDisplay('btcChange', btcChange);
  updateChangeDisplay('ethChange', ethChange);
  updateChangeDisplay('aaplChange', aaplChange);
  
  const volume = (Math.random() * 50 + 100).toFixed(1);
  document.getElementById('totalVolume').innerHTML = `$${volume}B`;
}

function updateChangeDisplay(elementId, change) {
  const element = document.getElementById(elementId);
  const isPositive = parseFloat(change) >= 0;
  element.innerHTML = `${isPositive ? '+' : ''}${change}%`;
  element.className = `stat-change ${isPositive ? 'positive' : 'negative'}`;
}

function updatePortfolioValue() {
  let value = portfolio.balance;
  value += portfolio.positions.BTC * currentPrices.BTC;
  value += portfolio.positions.ETH * currentPrices.ETH;
  value += portfolio.positions.AAPL * currentPrices.AAPL;
  
  document.getElementById('portfolioValue').innerHTML = `$${value.toFixed(2)}`;
  document.getElementById('availableBalance').innerHTML = `$${portfolio.balance.toFixed(2)}`;
}

function updateTradePanel() {
  const currentAsset = getCurrentAsset();
  const price = currentPrices[currentAsset];
  document.getElementById('tradePrice').innerHTML = `$${price.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
  
  const amount = parseFloat(document.getElementById('tradeAmount').value) || 0;
  document.getElementById('orderTotal').innerHTML = `$${amount.toFixed(2)}`;
}

function getCurrentAsset() {
  const activeBtn = document.querySelector('.asset-btn.active');
  return activeBtn ? activeBtn.getAttribute('data-asset') : 'BTC';
}

// ========== CHART INITIALIZATION ==========
function initializeCharts() {
  // Price Chart
  const ctx = document.getElementById('priceChart').getContext('2d');
  const labels = generateDateLabels(7);
  const prices = generateHistoricalPrices(currentPrices.BTC);
  
  charts.price = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'BTC/USD',
        data: prices,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: '#3b82f6'
      }]
    },
    options: getChartOptions()
  });
  
  // Portfolio Chart
  const portfolioCtx = document.getElementById('portfolioChart').getContext('2d');
  charts.portfolio = new Chart(portfolioCtx, {
    type: 'doughnut',
    data: {
      labels: ['Bitcoin', 'Ethereum', 'Apple', 'Cash'],
      datasets: [{
        data: [0, 0, 0, portfolio.balance],
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { labels: { color: '#eef5ff', font: { size: 11 } } }
      }
    }
  });
  
  // Activity Chart
  const activityCtx = document.getElementById('activityChart').getContext('2d');
  charts.activity = new Chart(activityCtx, {
    type: 'bar',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Trades',
        data: [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: '#3b82f6',
        borderRadius: 4
      }]
    },
    options: getBarChartOptions()
  });
}

function generateDateLabels(days) {
  const labels = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    labels.push(date.toLocaleDateString());
  }
  return labels;
}

function generateHistoricalPrices(currentPrice) {
  const prices = [];
  for (let i = 6; i >= 0; i--) {
    const variation = (Math.random() - 0.5) * 0.08;
    prices.push(currentPrice * (1 + variation));
  }
  return prices;
}

function getChartOptions() {
  return {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { labels: { color: '#eef5ff' } },
      tooltip: { backgroundColor: 'rgba(15, 25, 45, 0.95)' }
    },
    scales: {
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#eef5ff' } },
      x: { grid: { display: false }, ticks: { color: '#eef5ff' } }
    }
  };
}

function getBarChartOptions() {
  return {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: 'rgba(15, 25, 45, 0.95)' }
    },
    scales: {
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#eef5ff' } },
      x: { grid: { display: false }, ticks: { color: '#eef5ff' } }
    }
  };
}

function updateChart() {
  if (!charts.price) return;
  const newPrice = currentPrices.BTC;
  charts.price.data.datasets[0].data.push(newPrice);
  charts.price.data.labels.push(new Date().toLocaleDateString());
  if (charts.price.data.labels.length > 7) {
    charts.price.data.labels.shift();
    charts.price.data.datasets[0].data.shift();
  }
  charts.price.update();
}

function updatePortfolioChart() {
  if (!charts.portfolio) return;
  charts.portfolio.data.datasets[0].data = [
    portfolio.positions.BTC * currentPrices.BTC,
    portfolio.positions.ETH * currentPrices.ETH,
    portfolio.positions.AAPL * currentPrices.AAPL,
    portfolio.balance
  ];
  charts.portfolio.update();
}

// ========== TRADING ENGINE ==========
function executeTrade(type) {
  const asset = getCurrentAsset();
  const amount = parseFloat(document.getElementById('tradeAmount').value);
  const price = currentPrices[asset];
  
  if (isNaN(amount) || amount <= 0) {
    showFeedback('Please enter a valid amount', 'error');
    return;
  }
  
  if (type === 'buy') {
    if (amount > portfolio.balance) {
      showFeedback('Insufficient balance', 'error');
      return;
    }
    
    const units = amount / price;
    portfolio.positions[asset] += units;
    portfolio.balance -= amount;
    
    addTrade(asset, 'BUY', units.toFixed(5), price, amount);
    showFeedback(`Bought ${units.toFixed(5)} ${asset} at $${price.toFixed(2)}`, 'success');
    updateStreak(true);
  } else {
    const units = amount / price;
    if (portfolio.positions[asset] < units) {
      showFeedback('Insufficient holdings', 'error');
      return;
    }
    
    portfolio.positions[asset] -= units;
    portfolio.balance += amount;
    
    addTrade(asset, 'SELL', units.toFixed(5), price, amount);
    showFeedback(`Sold ${units.toFixed(5)} ${asset} at $${price.toFixed(2)}`, 'info');
    updateStreak(true);
  }
  
  updateAllDisplays();
  updatePortfolioChart();
  updateAnalytics();
  renderHistory();
  updatePositionsList();
}

function addTrade(asset, type, quantity, price, total) {
  portfolio.trades.unshift({
    id: Date.now(),
    date: new Date().toLocaleString(),
    asset: asset,
    type: type,
    quantity: quantity,
    price: price.toFixed(2),
    total: total.toFixed(2),
    status: 'Completed'
  });
}

function updateStreak(isWin) {
  if (isWin) {
    if (lastTradeWin) winStreak++;
    else {
      winStreak = 1;
      lastTradeWin = true;
    }
  } else {
    winStreak = 0;
    lastTradeWin = false;
  }
  
  document.getElementById('winStreak').innerHTML = winStreak;
  document.getElementById('streakBanner').innerHTML = winStreak;
}

function showFeedback(message, type) {
  const feedback = document.getElementById('tradeFeedback');
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  feedback.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i> ${message}`;
  feedback.style.background = type === 'success' ? 'rgba(16, 185, 129, 0.15)' : type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)';
  
  setTimeout(() => {
    feedback.innerHTML = '<i class="fas fa-info-circle"></i> Ready to trade';
    feedback.style.background = 'rgba(0, 0, 0, 0.2)';
  }, 3000);
}

// ========== POSITIONS DISPLAY ==========
function updatePositionsList() {
  const container = document.getElementById('positionsList');
  const positions = [];
  
  Object.keys(portfolio.positions).forEach(asset => {
    const qty = portfolio.positions[asset];
    if (qty > 0) {
      const value = qty * currentPrices[asset];
      positions.push({ asset, qty: qty.toFixed(5), value: value.toFixed(2) });
    }
  });
  
  if (positions.length === 0) {
    container.innerHTML = '<div class="no-positions">No open positions</div>';
    return;
  }
  
  container.innerHTML = positions.map(pos => `
    <div class="position-item">
      <div class="position-info">
        <h4>${pos.asset}/USD</h4>
        <span>${pos.qty} units</span>
      </div>
      <div class="position-value">
        <div class="amount">$${pos.value}</div>
        <div class="change positive">+${(Math.random() * 5).toFixed(2)}%</div>
      </div>
    </div>
  `).join('');
}

// ========== HISTORY RENDERING ==========
function renderHistory(filter = 'all') {
  const tbody = document.getElementById('historyList');
  let filtered = portfolio.trades;
  
  if (filter === 'buy') filtered = portfolio.trades.filter(t => t.type === 'BUY');
  if (filter === 'sell') filtered = portfolio.trades.filter(t => t.type === 'SELL');
  
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No trades executed yet</td></tr>';
    return;
  }
  
  tbody.innerHTML = filtered.slice(0, 20).map(trade => `
    <tr>
      <td>${trade.date}</td>
      <td><strong>${trade.asset}</strong></td>
      <td class="${trade.type === 'BUY' ? 'buy-type' : 'sell-type'}">${trade.type}</td>
      <td>${trade.quantity}</td>
      <td>$${trade.price}</td>
      <td>$${trade.total}</td>
      <td><span class="badge" style="background: rgba(16,185,129,0.15); color:#10b981;">${trade.status}</span></td>
    </tr>
  `).join('');
}

// ========== ANALYTICS UPDATE ==========
function updateAnalytics() {
  const totalTrades = portfolio.trades.length;
  const buyTrades = portfolio.trades.filter(t => t.type === 'BUY').length;
  const sellTrades = portfolio.trades.filter(t => t.type === 'SELL').length;
  
  let totalProfit = 0;
  let winningTrades = 0;
  let bestTrade = 0;
  
  // Simplified profit calculation
  portfolio.trades.forEach(trade => {
    if (trade.type === 'SELL') {
      const profit = Math.random() * 100 - 20;
      totalProfit += profit;
      if (profit > bestTrade) bestTrade = profit;
      if (profit > 0) winningTrades++;
    }
  });
  
  const winRate = sellTrades > 0 ? ((winningTrades / sellTrades) * 100).toFixed(1) : 0;
  const avgReturn = sellTrades > 0 ? (totalProfit / sellTrades).toFixed(2) : 0;
  
  document.getElementById('totalTrades').innerHTML = totalTrades;
  document.getElementById('winRate').innerHTML = `${winRate}%`;
  document.getElementById('winRateBanner').innerHTML = `${winRate}%`;
  document.getElementById('profitLoss').innerHTML = `$${totalProfit.toFixed(2)}`;
  document.getElementById('profitLoss').style.color = totalProfit >= 0 ? '#10b981' : '#ef4444';
  document.getElementById('bestTrade').innerHTML = bestTrade > 0 ? `$${bestTrade.toFixed(2)}` : '-';
  document.getElementById('avgReturn').innerHTML = `${avgReturn}%`;
  document.getElementById('avgReturn').style.color = parseFloat(avgReturn) >= 0 ? '#10b981' : '#ef4444';
}

// ========== AI INSIGHTS ==========
function generateInsights() {
  const insights = [
    { icon: "📈", title: "Bullish Momentum", desc: "BTC breaking key resistance levels", score: "High" },
    { icon: "📊", title: "Technical Analysis", desc: "Golden cross forming on ETH", score: "Medium" },
    { icon: "💎", title: "Accumulation Alert", desc: "Whale activity detected on AAPL", score: "High" }
  ];
  
  const container = document.getElementById('recommendationList');
  container.innerHTML = insights.map(insight => `
    <div class="insight-item">
      <div class="insight-icon">${insight.icon}</div>
      <div class="insight-content">
        <div class="insight-title">${insight.title}</div>
        <div class="insight-desc">${insight.desc}</div>
      </div>
      <div class="insight-score">${insight.score}</div>
    </div>
  `).join('');
}

// ========== EVENT HANDLERS ==========
function initEventListeners() {
  // Asset selector
  document.querySelectorAll('.asset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.asset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateTradePanel();
    });
  });
  
  // Quick amounts
  document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const amount = btn.getAttribute('data-amount');
      document.getElementById('tradeAmount').value = amount;
      updateTradePanel();
    });
  });
  
  // Trade amount input
  document.getElementById('tradeAmount').addEventListener('input', () => updateTradePanel());
  
  // Trade buttons
  document.getElementById('buyBtn').addEventListener('click', () => executeTrade('buy'));
  document.getElementById('sellBtn').addEventListener('click', () => executeTrade('sell'));
  
  // Refresh button
  document.getElementById('refreshData').addEventListener('click', async () => {
    await fetchMarketData();
    showFeedback('Data refreshed', 'success');
  });
  
  // Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const pageId = item.getAttribute('data-page');
      document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
      document.getElementById(`${pageId}Page`).classList.add('active');
      
      const titles = { dashboard: 'Dashboard', trade: 'Trade', history: 'History', analytics: 'Analytics', settings: 'Settings' };
      document.getElementById('pageTitle').innerHTML = titles[pageId];
      document.getElementById('breadcrumbCurrent').innerHTML = titles[pageId];
      
      if (pageId === 'analytics') updateAnalytics();
      if (pageId === 'history') renderHistory();
    });
  });
  
  // History filters
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderHistory(btn.getAttribute('data-filter'));
    });
  });
  
  // Chart time buttons
  document.querySelectorAll('.time-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // Would implement different time ranges here
    });
  });
  
  // Mobile menu
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const sidebar = document.querySelector('.sidebar');
  if (mobileBtn) {
    mobileBtn.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });
  }
}

// ========== INITIALIZATION ==========
async function init() {
  await fetchMarketData();
  initializeCharts();
  generateInsights();
  initEventListeners();
  updateAllDisplays();
  updatePortfolioChart();
  updateAnalytics();
  renderHistory();
  updatePositionsList();
  
  // Auto-refresh every 10 seconds
  setInterval(async () => {
    await fetchMarketData();
    generateInsights();
    updatePortfolioChart();
    updateAnalytics();
  }, 10000);
}

// Start the application
init();