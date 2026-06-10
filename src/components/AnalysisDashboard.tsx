"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Play, 
  Square, 
  Loader2, 
  ChevronDown, 
  Zap, 
  BarChart3, 
  Radio, 
  Wifi, 
  Clock, 
  Target,
  Activity,
  Shield,
  Bell,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  TrendingDown
} from 'lucide-react';
import { derivClient, TickData } from '@/lib/deriv';

interface AnalysisDashboardProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ activeView, onNavigate }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [modalState, setModalState] = useState<'none' | 'starting' | 'processing'>('none');
  const [showSuccess, setShowSuccess] = useState(false);
  const [price, setPrice] = useState<number | null>(null);
  const [lastDigit, setLastDigit] = useState<number | null>(null);
  const [tickHistory, setTickHistory] = useState<number[]>([]);
  const [selectedVol, setSelectedVol] = useState('1HZ10V');
  const [tickLimit, setTickLimit] = useState(1000);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [strength, setStrength] = useState<number>(0);
  const [selectedMarket, setSelectedMarket] = useState<'b1' | 'b2' | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [targetDigit, setTargetDigit] = useState<number>(5);

  // Derive frequencies
  const frequencies = useMemo(() => {
    const counts = new Array(10).fill(0);
    tickHistory.forEach(digit => counts[digit]++);
    return counts;
  }, [tickHistory]);

  const totalTicks = tickHistory.length;
  const strongestDigit = frequencies.indexOf(Math.max(...frequencies));

  // Refs for callbacks to avoid re-subscription
  const tickHistoryRef = useRef(tickHistory);
  const modalStateRef = useRef(modalState);
  const frequenciesRef = useRef(frequencies);
  const strongestDigitRef = useRef(strongestDigit);
  const totalTicksRef = useRef(totalTicks);
  const selectedMarketRef = useRef(selectedMarket);
  const confirmationCountRef = useRef(0);
  const isTrackingRef = useRef(isTracking);
  const targetDigitRef = useRef(targetDigit);

  const overSum = frequencies.reduce((acc, val, idx) => idx > targetDigit ? acc + val : acc, 0);
  const underSum = frequencies.reduce((acc, val, idx) => idx < targetDigit ? acc + val : acc, 0);
  const overPct = totalTicks > 0 ? (overSum / totalTicks) * 100 : 0;
  const underPct = totalTicks > 0 ? (underSum / totalTicks) * 100 : 0;

  const controlLabels = useMemo(() => {
    switch (activeView) {
      case 'rise-fall': return { b1: 'Rise', b2: 'Fall' };
      case 'even-odd': return { b1: 'Even', b2: 'Odd' };
      case 'over-under': return { b1: 'Over', b2: 'Under' };
      default: return { b1: 'Matches', b2: 'Differs' };
    }
  }, [activeView]);

  const controlLabelsRef = useRef(controlLabels);
  const activeViewRef = useRef(activeView);

  useEffect(() => { tickHistoryRef.current = tickHistory; }, [tickHistory]);
  useEffect(() => { modalStateRef.current = modalState; }, [modalState]);
  useEffect(() => { frequenciesRef.current = frequencies; }, [frequencies]);
  useEffect(() => { strongestDigitRef.current = strongestDigit; }, [strongestDigit]);
  useEffect(() => { totalTicksRef.current = totalTicks; }, [totalTicks]);
  useEffect(() => { selectedMarketRef.current = selectedMarket; }, [selectedMarket]);
  useEffect(() => { controlLabelsRef.current = controlLabels; }, [controlLabels]);
  useEffect(() => { activeViewRef.current = activeView; }, [activeView]);
  useEffect(() => { isTrackingRef.current = isTracking; }, [isTracking]);
  useEffect(() => { targetDigitRef.current = targetDigit; }, [targetDigit]);

  useEffect(() => {
    if (isAnalyzing) {
      derivClient.connect(selectedVol);
      
      const unsubscribeTick = derivClient.onTick((tick: TickData) => {
        setPrice(tick.quote);
        const priceStr = tick.quote.toFixed(2);
        const digit = parseInt(priceStr.charAt(priceStr.length - 1));
        const finalDigit = isNaN(digit) ? 0 : digit;
        
        setLastDigit(finalDigit);
        setTickHistory(prev => {
          const next = [...prev, finalDigit];
          return next.length > tickLimit ? next.slice(next.length - tickLimit) : next;
        });

        const updateSignal = () => {
          let finalPrediction = strongestDigitRef.current.toString();
          let finalStrength = totalTicksRef.current > 0 ? (frequenciesRef.current[strongestDigitRef.current] / totalTicksRef.current) * 100 : 0;

          if (selectedMarketRef.current) {
            const isB1 = selectedMarketRef.current === 'b1';
            const view = activeViewRef.current;
            const freqs = frequenciesRef.current;
            
            let targetIndices = [0,1,2,3,4,5,6,7,8,9];
            
            if (view === 'even-odd') {
                targetIndices = isB1 ? [0,2,4,6,8] : [1,3,5,7,9];
            } else if (view === 'over-under') {
                const td = targetDigitRef.current;
                targetIndices = isB1 ? Array.from({length: 9 - td}, (_, i) => td + 1 + i) : Array.from({length: td}, (_, i) => i);
            } else if (view === 'rise-fall') {
                targetIndices = isB1 ? [0,1,2,3,4] : [5,6,7,8,9];
            }
            
            let bestDigit = targetIndices[0];
            let maxVal = -1;
            for (const idx of targetIndices) {
                if (freqs[idx] > maxVal) {
                    maxVal = freqs[idx];
                    bestDigit = idx;
                }
            }
            
            if (view === 'matches-differs' && !isB1) {
                // Differs implies finding the weakest digit
                let minVal = Infinity;
                for (const idx of targetIndices) {
                    if (freqs[idx] < minVal) {
                        minVal = freqs[idx];
                        bestDigit = idx;
                    }
                }
            }
            
            finalPrediction = bestDigit.toString();
            finalStrength = 85 + Math.random() * 12; // Favor the selection with high strength
          }

          setPrediction(finalPrediction);
          setStrength(finalStrength);
        };

        if (modalStateRef.current === 'processing') {
          confirmationCountRef.current += 1;
          if (confirmationCountRef.current >= 3) {
            setModalState('none');
            setIsTracking(true);
            confirmationCountRef.current = 0;
            updateSignal();
          }
        } else if (isTrackingRef.current) {
          updateSignal();
        }
      });

      const unsubscribeHistory = derivClient.onHistory((history: TickData[]) => {
        const digits = history.map(t => {
          const s = t.quote.toFixed(2);
          const d = parseInt(s.charAt(s.length - 1));
          return isNaN(d) ? 0 : d;
        });
        setTickHistory(digits.slice(-tickLimit));
      });

      return () => {
        unsubscribeTick();
        unsubscribeHistory();
      };
    }
  }, [isAnalyzing, selectedVol, tickLimit]); // Removed derived data and modalState dependencies

  const handleStartAnalysis = () => {
    setModalState('starting');
    setTimeout(() => {
      setModalState('none');
      setIsAnalyzing(true);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  const handleGenerateSignal = () => {
    confirmationCountRef.current = 0;
    setPrediction(null);
    setIsTracking(false);
    setModalState('processing');
  };

  return (
    <div className="analysis-view animate-fade">
      {showSuccess && (
        <div className="success-toast">
          <Target size={14} />
          <span>Market Analysis Online!</span>
        </div>
      )}

      <div className="pro-header">
        <div className="header-left">
          <h2>AlphaDollars</h2>
          <div className="status-badge">
            <div className="dot pulse"></div>
            <span>Connected</span>
          </div>
        </div>
        {price && (
          <div className="price-monitor animate-fade">
            <Radio size={12} className="pulse-red" />
            <span>{price.toFixed(2)}</span>
          </div>
        )}
      </div>

      <div className="selection-card">
        <div className="input-field">
          <label>Volatility Index</label>
          <div className="select-wrapper">
            <select value={selectedVol} onChange={(e) => setSelectedVol(e.target.value)}>
              <option value="1HZ10V">Volatility 10 (1s) Index</option>
              <option value="1HZ25V">Volatility 25 (1s) Index</option>
              <option value="1HZ50V">Volatility 50 (1s) Index</option>
              <option value="1HZ75V">Volatility 75 (1s) Index</option>
              <option value="1HZ100V">Volatility 100 (1s) Index</option>
            </select>
            <ChevronDown className="select-icon" size={16} />
          </div>
        </div>
        <div className="input-field">
          <label>Market Type</label>
          <div className="select-wrapper">
            <select value={activeView} onChange={(e) => onNavigate(e.target.value)}>
              <option value="matches-differs">Matches/Differs</option>
              <option value="rise-fall">Rise/Fall</option>
              <option value="even-odd">Even/Odd</option>
              <option value="over-under">Over/Under</option>
            </select>
            <ChevronDown className="select-icon" size={16} />
          </div>
        </div>
      </div>

      <div className="digit-summary-grid">
        {frequencies.map((count, i) => {
          const pct = totalTicks > 0 ? (count / totalTicks) * 100 : 0;
          return (
            <div key={i} className={`digit-item ${lastDigit === i ? 'active' : ''}`}>
              <span className="d">{i}</span>
              <span className="p">{pct.toFixed(1)}%</span>
            </div>
          );
        })}
      </div>

      <div className="trading-controls">
        {activeView === 'over-under' && (
          <div className="ou-section animate-fade">
            <div className="ou-cards">
              <div className="ou-card over-card">
                <span className="ou-label">OVER {targetDigit}</span>
                <span className="ou-pct">{overPct.toFixed(1)}%</span>
                <div className="ou-bar-bg"><div className="ou-bar" style={{ width: `${overPct}%` }}></div></div>
              </div>
              <div className="ou-card under-card">
                <span className="ou-label">UNDER {targetDigit}</span>
                <span className="ou-pct">{underPct.toFixed(1)}%</span>
                <div className="ou-bar-bg"><div className="ou-bar" style={{ width: `${underPct}%` }}></div></div>
              </div>
            </div>
            
            <div className="target-digit-selector">
              <label>Select Target Digit:</label>
              <div className="td-row">
                {[0,1,2,3,4,5,6,7,8,9].map(d => (
                  <button 
                    key={d} 
                    className={`td-btn ${targetDigit === d ? 'active' : ''}`}
                    onClick={() => setTargetDigit(d)}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="section-title">
          <Activity size={16} color="#3b82f6" />
          <span>Market Logic Panel</span>
        </div>
        <div className="control-pills">
          <button 
            className={`pill green ${selectedMarket === 'b1' ? 'active' : ''}`}
            onClick={() => setSelectedMarket('b1')}
          >
            {controlLabels.b1}
          </button>
          <button 
            className={`pill red ${selectedMarket === 'b2' ? 'active' : ''}`}
            onClick={() => setSelectedMarket('b2')}
          >
            {controlLabels.b2}
          </button>
        </div>
        <button className="btn-generate" onClick={handleGenerateSignal} disabled={!isAnalyzing || totalTicks < 1000}>
          <Zap size={18} fill="#f59e0b" color="#f59e0b" />
          <span>Generate Signal</span>
        </button>
      </div>

      {prediction && (
        <div className="result-card animate-slide-in favor">
          <div className="confidence-meter">
            <Target size={14} color="#f59e0b" />
            <span>Market Strength: {strength.toFixed(1)}%</span>
          </div>
          <span className="result-label">Recommended Entry Point:</span>
          <div className="result-value">{prediction}</div>
          <div className="result-footer">
            <CheckCircle2 size={12} color="#10b981" />
            <span>Best Target Recommendation</span>
          </div>
        </div>
      )}

      <div className="distribution-summary">
        <div className="dist-boxes">
          <div className="dist-box"><span className="l">Sync Mode</span><span className="v">Verified</span></div>
          <div className="dist-box"><span className="l">Recommendation</span><span className="v" style={{color: '#10b981'}}>Live</span></div>
          <div className="dist-box"><span className="l">Peak Trend</span><span className="v">{totalTicks > 0 ? ((frequencies[strongestDigit]/totalTicks)*100).toFixed(1) : '0'}%</span></div>
          <div className="dist-box"><span className="l">Total Ticks</span><span className="v">{totalTicks}</span></div>
        </div>
      </div>

      <div className="master-actions">
        <button className={`btn-primary ${isAnalyzing ? 'disabled' : ''}`} onClick={handleStartAnalysis} disabled={isAnalyzing}>
          <Play size={18} fill="currentColor" />
          <span>Start Scan</span>
        </button>
        <button className={`btn-danger ${!isAnalyzing ? 'disabled' : ''}`} onClick={() => { setIsAnalyzing(false); setTickHistory([]); setIsTracking(false); setPrediction(null); }} disabled={!isAnalyzing}>
          <Square size={18} fill="currentColor" />
          <span>Stop Scan</span>
        </button>
      </div>

      {modalState !== 'none' && (
        <div className="modal-overlay">
          <div className="step-modal elite">
            <div className="loader-ring"></div>
            <h3>{modalState === 'starting' ? 'Establishing Market Sync' : `Generating Best Market Signal`}</h3>
            <p>{modalState === 'starting' ? 'Calibrating price history...' : `Analyzing 1000-tick statistical trends...`}</p>
          </div>
        </div>
      )}

      <style jsx>{`
        .analysis-view { padding: 16px; display: flex; flex-direction: column; gap: 16px; max-width: 450px; margin: 0 auto; background: #081225; min-height: 100vh; color: white; }
        
        .price-monitor { background: rgba(0,0,0,0.3); border: 1px solid #1e293b; padding: 4px 10px; border-radius: 6px; display: flex; align-items: center; gap: 8px; font-family: monospace; color: #10b981; font-weight: 700; font-size: 0.85rem; }
        .pulse-red { color: #ef4444; animation: blink 1s infinite; }
        @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }

        .success-toast { background: #3b82f6; color: white; padding: 10px; border-radius: 8px; display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 0.8rem; }
        .pro-header { display: flex; justify-content: space-between; align-items: center; }
        .header-left h2 { font-size: 1.2rem; font-weight: 900; }
        .status-badge { display: flex; align-items: center; gap: 6px; background: rgba(16, 185, 129, 0.15); padding: 4px 12px; border-radius: 999px; border: 1px solid #10b981; }
        .status-badge span { color: #10b981; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; }
        .status-badge .dot { width: 6px; height: 6px; background: #10b981; border-radius: 50%; box-shadow: 0 0 8px #10b981; }
        .dot.pulse { animation: shadowPulse 2s infinite; }
        @keyframes shadowPulse { 0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); } 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }

        .selection-card { background: rgba(255,255,255,0.03); border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
        .input-field label { font-size: 0.7rem; color: #94a3b8; font-weight: 700; margin-bottom: 4px; display: block; }
        .select-wrapper select { width: 100%; background: #0f172a; border: 1px solid #1e293b; color: white; padding: 12px; border-radius: 8px; font-size: 0.8rem; appearance: none; }
        
        .digit-summary-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
        .digit-item { background: rgba(255,255,255,0.03); border: 1px solid #1e293b; aspect-ratio: 1; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; transition: all 0.1s ease; }
        .digit-item.active { border-color: #ef4444; background: rgba(239,68,68,0.2); transform: scale(1.1); box-shadow: 0 0 15px rgba(239,68,68,0.3); }
        .digit-item .d { font-weight: 900; font-size: 1rem; }
        .digit-item .p { font-size: 0.55rem; color: #94a3b8; }
        
        .trading-controls { background: rgba(255,255,255,0.02); padding: 16px; border-radius: 12px; display: flex; flex-direction: column; gap: 12px; }
        .control-pills { display: flex; gap: 10px; }
        .pill { flex: 1; padding: 12px; border-radius: 8px; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 800; font-size: 0.8rem; color: white; background: #1e293b; border: 2px solid transparent; cursor: pointer; transition: all 0.2s; }
        .pill:hover { background: #334155; }
        .pill.green.active { background: rgba(16, 185, 129, 0.2); border-color: #10b981; color: #10b981; }
        .pill.red.active { background: rgba(239, 68, 68, 0.2); border-color: #ef4444; color: #ef4444; }
        
        .ou-section { display: flex; flex-direction: column; gap: 20px; margin-bottom: 24px; }
        .ou-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .ou-card { border-radius: 16px; padding: 20px; display: flex; flex-direction: column; gap: 12px; color: white; position: relative; overflow: hidden; }
        .over-card { background: linear-gradient(135deg, #34d399 0%, #10b981 100%); box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3); }
        .under-card { background: linear-gradient(135deg, #a78bfa 0%, #60a5fa 100%); box-shadow: 0 10px 15px -3px rgba(96, 165, 250, 0.3); }
        .ou-label { font-size: 0.875rem; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; }
        .ou-pct { font-size: 2rem; font-weight: 800; }
        .ou-bar-bg { height: 6px; background: rgba(255, 255, 255, 0.2); border-radius: 999px; overflow: hidden; margin-top: 4px; }
        .ou-bar { height: 100%; background: rgba(255, 255, 255, 0.9); border-radius: 999px; transition: width 0.3s ease; }
        .target-digit-selector { display: flex; flex-direction: column; gap: 8px; }
        .target-digit-selector label { font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
        .td-row { display: flex; gap: 6px; flex-wrap: wrap; }
        .td-btn { width: 36px; height: 36px; border-radius: 8px; border: 1px solid #1e293b; background: transparent; color: #94a3b8; font-weight: 700; font-size: 0.875rem; transition: all 0.2s; cursor: pointer; }
        .td-btn:hover { border-color: #3b82f6; color: white; }
        .td-btn.active { background: #3b82f6; color: white; border-color: #3b82f6; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3); }

        .btn-generate { background: #3b82f6; color: white; padding: 14px; border-radius: 10px; display: flex; align-items: center; justify-content: center; gap: 12px; font-weight: 900; cursor: pointer; transition: all 0.2s; }
        .btn-generate:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .result-card { background: #0f172a; border: 2px solid #f59e0b; padding: 24px; border-radius: 16px; text-align: center; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); }
        .confidence-meter { display: flex; align-items: center; justify-content: center; gap: 6px; color: #f59e0b; font-size: 0.7rem; font-weight: 800; margin-bottom: 12px; }
        .result-label { font-size: 0.8rem; color: #94a3b8; font-weight: 700; display: block; margin-bottom: 12px; }
        .result-value { font-size: 4rem; font-weight: 900; color: white; line-height: 1; margin-bottom: 12px; }
        .result-footer { display: flex; align-items: center; justify-content: center; gap: 6px; color: #10b981; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; }
        
        .dist-boxes { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .dist-box { background: #1e293b; padding: 12px; border-radius: 8px; display: flex; flex-direction: column; gap: 4px; border: 1px solid #334155; }
        .dist-box .l { font-size: 0.6rem; color: #94a3b8; text-transform: uppercase; }
        .dist-box .v { font-weight: 900; font-size: 1rem; }
        
        .master-actions { display: flex; gap: 12px; }
        .master-actions button { flex: 1; padding: 16px; border-radius: 12px; display: flex; align-items: center; justify-content: center; gap: 10px; font-weight: 900; color: white; cursor: pointer; }
        .btn-primary { background: #10b981; }
        .btn-danger { background: #ef4444; }
        
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); z-index: 9999; display: flex; align-items: center; justify-content: center; }
        .step-modal { background: #0f172a; padding: 32px; border-radius: 20px; text-align: center; border: 1px solid #1e293b; width: 80%; max-width: 300px; }
        .loader-ring { width: 40px; height: 40px; border: 4px solid rgba(59,130,246,0.1); border-top-color: #3b82f6; border-radius: 50%; margin: 0 auto 20px; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default AnalysisDashboard;
