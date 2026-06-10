// ========== ORGANIZED MODULAR JAVASCRIPT ==========
// Trading Dashboard Application - NexusTrade
// Follows separation of concerns: Data Layer, UI Layer, Trading Engine, Recommendation Engine

(function() {
  // ========== 1. DATA LAYER (State & Market Simulation) ==========
  const MarketData = {
    // Current market indicators
    indices: {
      spx: { value: 4512.30, change: 0.87, trend: 'up' },
      nasdaq: { value: 15892.10, change: 1.24, trend: 'up' },
      btc: { value: 61280, change: 2.3, trend: 'up' }
    },
    volume: '128.5B',
    
    // Asset prices for trading
    assetPrices: {
      BTC: 61280.50,
      ETH: 3420.75,
      AAPL: 187.32
    },
    
    currentAsset: 'BTC',
    tradeScore: 68,  // portfolio health / confidence score
    
    // Update market with random walk simulation
    updateMarket() {
      const spxMove = (Math.random() * 1.2 - 0.2).toFixed(2);
      const nasMove = (Math.random() * 1.4 - 0.1).toFixed(2);
      const btcMovePercent = (Math.random() * 2.0 - 0.3).toFixed(2);
      
      this.indices.spx.value = parseFloat((this.indices.spx.value * (1 + spxMove/100)).toFixed(2));
      this.indices.spx.change = parseFloat(spxMove);
      this.indices.nasdaq.value = parseFloat((this.indices.nasdaq.value * (1 + nasMove/100)).toFixed(2));
      this.indices.nasdaq.change = parseFloat(nasMove);
      this.indices.btc.value = Math.floor(this.indices.btc.value * (1 + btcMovePercent/100));
      this.indices.btc.change = parseFloat(btcMovePercent);
      
      // Update asset prices based on current selection
      if (this.currentAsset === 'BTC') {
        this.assetPrices.BTC = this.indices.btc.value + (Math.random() * 80 - 40);
      } else if (this.currentAsset === 'ETH') {
        let ethDelta = (Math.random() * 12 - 5);
        this.assetPrices.ETH = Math.max(3000, this.assetPrices.ETH + ethDelta);
        this.assetPrices.ETH = parseFloat(this.assetPrices.ETH.toFixed(2));
      } else if (this.currentAsset === 'AAPL') {
        let aaplDelta = (Math.random() * 1.8 - 0.6);
        this.assetPrices.AAPL = Math.max(170, this.assetPrices.AAPL + aaplDelta);
        this.assetPrices.AAPL = parseFloat(this.assetPrices.AAPL.toFixed(2));
      }
      
      // Random volume update
      this.volume = `$${(Math.random() * 30 + 115).toFixed(1)}B`;
    }
  };
  
  // ========== 2. UI RENDERER (DOM Manipulation) ==========
  const UIRenderer = {
    updateStatsDisplay() {
      const spxEl = document.getElementById('spxVal');
      const spxChangeEl = document.getElementById('spxChange');
      if (spxEl) spxEl.innerText = MarketData.indices.spx.value.toLocaleString();
      if (spxChangeEl) {
        spxChangeEl.innerHTML = (MarketData.indices.spx.change >= 0 ? '▲ +' : '▼ ') + Math.abs(MarketData.indices.spx.change) + '%';
        spxChangeEl.className = MarketData.indices.spx.change >= 0 ? 'trend-up' : 'trend-down';
      }
      
      const nasEl = document.getElementById('nasVal');
      const nasChangeEl = document.getElementById('nasChange');
      if (nasEl) nasEl.innerText = MarketData.indices.nasdaq.value.toLocaleString();
      if (nasChangeEl) {
        nasChangeEl.innerHTML = (MarketData.indices.nasdaq.change >= 0 ? '▲ +' : '▼ ') + Math.abs(MarketData.indices.nasdaq.change) + '%';
        nasChangeEl.className = MarketData.indices.nasdaq.change >= 0 ? 'trend-up' : 'trend-down';
      }
      
      const btcEl = document.getElementById('btcVal');
      const btcChangeEl = document.getElementById('btcChange');
      if (btcEl) btcEl.innerText = '$' + MarketData.indices.btc.value.toLocaleString();
      if (btcChangeEl) {
        btcChangeEl.innerHTML = (MarketData.indices.btc.change >= 0 ? '▲ +' : '▼ ') + Math.abs(MarketData.indices.btc.change) + '%';
        btcChangeEl.className = MarketData.indices.btc.change >= 0 ? 'trend-up' : 'trend-down';
      }
      
      const volEl = document.getElementById('volVal');
      if (volEl) volEl.innerText = MarketData.volume;
    },
    
    updatePriceDisplay() {
      const priceElem = document.getElementById('currentAssetPrice');
      if (!priceElem) return;
      const price = MarketData.assetPrices[MarketData.currentAsset];
      priceElem.innerText = `$${price.toFixed(2)}`;
    },
    
    updateProgressAndRecommendations(recommendations, score, label) {
      const progressFill = document.getElementById('progressFill');
      const progressLabel = document.getElementById('progressLabel');
      if (progressFill) progressFill.style.width = score + '%';
      if (progressLabel) progressLabel.innerHTML = label;
      
      const recContainer = document.getElementById('recommendationList');
      if (recContainer && recommendations.length) {
        recContainer.innerHTML = recommendations.map(rec => `
          <div class="rec-item">
            <div class="rec-icon">${rec.icon || '💡'}</div>
            <div class="rec-text">
              <div class="rec-title">${rec.title}</div>
              <div class="rec-sub">${rec.desc}</div>
            </div>
            <div class="badge-score">AI ⚡</div>
          </div>
        `).join('');
      }
    },
    
    setTradeFeedback(message, isError = false) {
      const feedbackDiv = document.getElementById('tradeFeedback');
      if (feedbackDiv) {
        feedbackDiv.innerHTML = `<i class="fas ${isError ? 'fa-exclamation-triangle' : 'fa-chart-line'}"></i> ${message}`;
        setTimeout(() => {
          if (document.getElementById('tradeFeedback') === feedbackDiv) {
            feedbackDiv.innerHTML = '<i class="fas fa-chart-line"></i> Ready for next trade.';
          }
        }, 2800);
      }
    }
  };
  
  // ========== 3. RECOMMENDATION ENGINE ==========
  const RecommendationEngine = {
    generate() {
      const btcTrend = MarketData.indices.btc.change;
      const spxTrend = MarketData.indices.spx.change;
      const overallBullish = (parseFloat(btcTrend) + parseFloat(spxTrend)) > 1.2;
      
      // Update trader score based on market sentiment
      let newScore = MarketData.tradeScore;
      if (overallBullish && newScore < 92) {
        newScore += Math.random() * 2;
      } else if (!overallBullish && newScore > 12) {
        newScore -= Math.random() * 1.2;
      }
      newScore = Math.min(94, Math.max(18, newScore));
      MarketData.tradeScore = parseFloat(newScore.toFixed(1));
      
      let label = MarketData.tradeScore > 70 ? '🔥 Elite Momentum' : 
                  (MarketData.tradeScore > 45 ? '📈 Balanced Growth' : '⚡ Accumulation Zone');
      
      let recArray = [];
      if (overallBullish) {
        recArray.push({ 
          title: "📊 BULLISH DIVERGENCE", 
          desc: "RSI signals accumulation on BTC. Consider scaling longs.", 
          icon: "🔥" 
        });
        recArray.push({ 
          title: "💎 TECH SECTOR STRENGTH", 
          desc: "AAPL above 50MA; Target $192 next resistance.", 
          icon: "📱" 
        });
        recArray.push({ 
          title: "⚡ Layer-2 Momentum", 
          desc: "ETH gas fees drop — positive for DeFi TVL growth.", 
          icon: "⛓️" 
        });
      } else {
        recArray.push({ 
          title: "🛡️ HEDGE STRATEGY", 
          desc: "Gold & dollar strength rising, reduce risk exposure.", 
          icon: "⚖️" 
        });
        recArray.push({ 
          title: "📉 SHORT-TERM CORRECTION", 
          desc: "Take partial profits on tech, wait for support levels.", 
          icon: "📉" 
        });
      }
      
      // Asset-specific recommendation
      const currentAssetPrice = MarketData.assetPrices[MarketData.currentAsset];
      if (MarketData.currentAsset === 'BTC' && currentAssetPrice > 62000) {
        recArray.unshift({ 
          title: "🚀 BTC BREAKOUT WATCH", 
          desc: "If price sustains above 62k, next target 65k.", 
          icon: "📈" 
        });
      } else if (MarketData.currentAsset === 'ETH' && currentAssetPrice < 3350) {
        recArray.unshift({ 
          title: "🔄 ETH Support Bounce", 
          desc: "Strong buy zone near 3320, accumulation signal.", 
          icon: "🟢" 
        });
      }
      
      recArray.push({ 
        title: `🎯 Smart order suggestion`, 
        desc: `${MarketData.currentAsset} volatility compression — limit orders recommended`, 
        icon: "📌" 
      });
      
      return { recommendations: recArray.slice(0, 3), score: MarketData.tradeScore, label: label };
    }
  };
  
  // ========== 4. TRADING ENGINE ==========
  const TradingEngine = {
    executeTrade(type) {
      let amount = parseFloat(document.getElementById('tradeAmount').value);
      if (isNaN(amount) || amount <= 0) {
        UIRenderer.setTradeFeedback('Please enter a valid amount > 0', true);
        return;
      }
      
      const currentPrice = MarketData.assetPrices[MarketData.currentAsset];
      let feedbackMsg = '';
      const success = Math.random() > 0.1; // 90% success simulation
      
      if (type === 'buy') {
        if (success) {
          let units = (amount / currentPrice).toFixed(5);
          feedbackMsg = `✅ Bought ${units} ${MarketData.currentAsset} @ $${currentPrice.toFixed(2)}. Order filled.`;
          MarketData.tradeScore = Math.min(96, MarketData.tradeScore + 1.2);
        } else {
          feedbackMsg = `⚠️ Slippage: Buy order partially filled. Retry with limit.`;
          MarketData.tradeScore = Math.max(20, MarketData.tradeScore - 0.8);
        }
      } else {
        if (success) {
          let units = (amount / currentPrice).toFixed(5);
          feedbackMsg = `📉 Sold ${units} ${MarketData.currentAsset} @ $${currentPrice.toFixed(2)}. Profit simulation active.`;
          MarketData.tradeScore = Math.min(94, MarketData.tradeScore + 0.9);
        } else {
          feedbackMsg = `⚠️ Insufficient liquidity: Sell order delayed. Try smaller size.`;
          MarketData.tradeScore = Math.max(18, MarketData.tradeScore - 1);
        }
      }
      
      UIRenderer.setTradeFeedback(feedbackMsg);
      // Refresh recommendations after trade
      const recData = RecommendationEngine.generate();
      UIRenderer.updateProgressAndRecommendations(recData.recommendations, recData.score, recData.label);
    }
  };
  
  // ========== 5. EVENT HANDLERS & INITIALIZATION ==========
  function initAssetSelector() {
    const options = document.querySelectorAll('.asset-option');
    options.forEach(opt => {
      opt.addEventListener('click', () => {
        options.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        const asset = opt.getAttribute('data-asset');
        MarketData.currentAsset = asset;
        UIRenderer.updatePriceDisplay();
        const recData = RecommendationEngine.generate();
        UIRenderer.updateProgressAndRecommendations(recData.recommendations, recData.score, recData.label);
        UIRenderer.setTradeFeedback(`Switched to ${asset} · live price streaming`);
      });
    });
  }
  
  function bindTradeButtons() {
    const buyBtn = document.getElementById('buyBtn');
    const sellBtn = document.getElementById('sellBtn');
    if (buyBtn) buyBtn.addEventListener('click', () => TradingEngine.executeTrade('buy'));
    if (sellBtn) sellBtn.addEventListener('click', () => TradingEngine.executeTrade('sell'));
  }
  
  function startLiveSimulation() {
    // Initial render
    UIRenderer.updateStatsDisplay();
    UIRenderer.updatePriceDisplay();
    const initialRec = RecommendationEngine.generate();
    UIRenderer.updateProgressAndRecommendations(initialRec.recommendations, initialRec.score, initialRec.label);
    
    // Update market every 8 seconds
    setInterval(() => {
      MarketData.updateMarket();
      UIRenderer.updateStatsDisplay();
      UIRenderer.updatePriceDisplay();
      const recData = RecommendationEngine.generate();
      UIRenderer.updateProgressAndRecommendations(recData.recommendations, recData.score, recData.label);
    }, 8000);
  }
  
  // Kickstart the application
  function init() {
    initAssetSelector();
    bindTradeButtons();
    startLiveSimulation();
  }
  
  // Start the app when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();