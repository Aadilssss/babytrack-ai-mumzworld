/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Baby, 
  ChevronRight, 
  AlertCircle, 
  Package, 
  Sparkles, 
  Loader2,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { BabyTrackOutput } from './types.ts';

const MUMZ_PINK = "#E91E8C";
const MUMZ_PURPLE = "#92278F";

export default function App() {
  const [moms, setMoms] = useState<{id: number, name: string}[]>([]);
  const [selectedMomId, setSelectedMomId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BabyTrackOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMoms();
  }, []);

  const fetchMoms = async () => {
    try {
      const res = await fetch('/api/moms');
      const data = await res.json();
      setMoms(data);
      if (data.length > 0) setSelectedMomId(data[0].id);
    } catch (err) {
      setError("Failed to load moms");
    }
  };

  const analyzeJourney = async () => {
    if (selectedMomId === null) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ momId: selectedMomId })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong during analysis");
    } finally {
      setLoading(false);
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage.toLowerCase()) {
      case 'pregnancy': return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'new_mumz_0_2mo': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'early_baby_2_4mo': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'baby_4_6mo': return 'bg-green-100 text-green-700 border-green-200';
      case 'toddler_12mo_plus': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen font-sans bg-[#F9FAFB]">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[var(--color-mumz-pink)] rounded-full flex items-center justify-center text-white font-bold text-xl">M</div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--color-mumz-pink)]">Mumzworld <span className="text-slate-400 font-light">|</span> <span className="text-[var(--color-mumz-purple)]">BabyTrack AI</span></h1>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-sm text-slate-500 font-medium">
            <span>Shop</span>
            <span>Community</span>
            <div className="w-8 h-8 rounded-full bg-slate-200"></div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Intro */}
        <section className="mb-10 text-center sm:text-left">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome to your AI Journey Analysis</h2>
          <p className="text-slate-500 max-w-2xl">Select a customer profile to predict their baby's developmental stage and upcoming needs.</p>
        </section>

        {/* Controls */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Select Mom Profile</label>
            <select 
              value={selectedMomId ?? ''} 
              onChange={(e) => setSelectedMomId(Number(e.target.value))}
              className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-[var(--color-mumz-pink)] focus:border-transparent outline-none transition-all"
            >
              {moms.map(mom => (
                <option key={mom.id} value={mom.id}>{mom.name}</option>
              ))}
            </select>
          </div>
          <button 
            onClick={analyzeJourney}
            disabled={loading}
            className="h-12 px-8 bg-[var(--color-mumz-pink)] hover:bg-[#D41B7F] disabled:bg-slate-300 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-95 w-full sm:w-auto"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            Analyze Journey
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 flex items-center gap-3 border border-red-100">
            <AlertCircle className="w-5 h-5" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-20 text-center"
            >
              <Loader2 className="w-12 h-12 text-[var(--color-mumz-pink)] animate-spin mx-auto mb-4" />
              <p className="text-slate-500 font-medium">Gemini is analyzing orders and predicting stages...</p>
            </motion.div>
          ) : result ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Left Column: Summary & Messages */}
              <div className="lg:col-span-2 space-y-8">
                {/* Result Hero */}
                <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200">
                  <div className="bg-gradient-to-r from-[var(--color-mumz-pink)] to-[var(--color-mumz-purple)] px-8 py-10 text-white">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                      <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getStageColor(result.baby_stage)}`}>
                        {result.baby_stage.replaceAll('_', ' ')}
                      </div>
                      <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                        <span className="text-xs font-medium">AI Confidence:</span>
                        <span className={`text-xs font-bold uppercase ${result.stage_confidence === 'high' ? 'text-green-300' : result.stage_confidence === 'medium' ? 'text-yellow-300' : 'text-red-300'}`}>
                          {result.stage_confidence}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold mb-2">Stage Detected: {result.baby_stage.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</h3>
                    <p className="text-white/80 max-w-xl">{result.confidence_reason}</p>
                  </div>

                  {result.uncertainty_flag && (
                    <div className="bg-amber-50 border-y border-amber-100 p-4 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-amber-900">Uncertainty Flag Detected</p>
                        <p className="text-sm text-amber-700">{result.uncertainty_reason}</p>
                      </div>
                    </div>
                  )}

                  <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* EN Message */}
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col h-full">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">EN</div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">English Note</span>
                      </div>
                      <p className="text-slate-700 italic flex-grow">"{result.message_en}"</p>
                    </div>

                    {/* AR Message */}
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 ar flex flex-col h-full text-right">
                      <div className="flex items-center justify-end gap-2 mb-4">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">ملاحظة بالعربية</span>
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">AR</div>
                      </div>
                      <p className="text-slate-800 text-lg flex-grow">"{result.message_ar}"</p>
                    </div>
                  </div>
                </div>

                {/* Recommendations Grid */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-xl font-bold flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[var(--color-mumz-pink)]" />
                      AI-Curated Recommendations
                    </h4>
                    <span className="text-xs text-slate-400 font-medium italic">Based on semantic stage matching</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.recommendations.map((item, idx) => (
                      <div key={idx} className="bg-white p-0 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col group h-full">
                        <div className="p-5 flex items-start gap-4 flex-grow">
                          <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-100">
                            <Package className="w-7 h-7 text-slate-400 group-hover:text-[var(--color-mumz-pink)] transition-colors" />
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{item.category}</div>
                            <h5 className="font-bold text-slate-900 mb-2 leading-tight">{item.product}</h5>
                            <div className="text-[var(--color-mumz-pink)] text-xs font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                              View Item <ArrowRight className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        </div>
                        <div className="bg-slate-50 p-4 border-t border-slate-100">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Sparkles className="w-3 h-3 text-[var(--color-mumz-pink)]" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">AI Justification</span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-normal italic">
                            "{item.reason}"
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Running Low sidebar */}
              <div className="space-y-8">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                  <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    Replenishment Alerts
                  </h4>
                  <div className="space-y-4">
                    {result.running_low.length === 0 ? (
                      <p className="text-slate-400 text-sm text-center py-8">No items detected as running low.</p>
                    ) : (
                      result.running_low.map((item, idx) => (
                        <div key={idx} className={`p-4 rounded-2xl border ${
                          item.urgency === 'high' ? 'bg-red-50 border-red-100' : 
                          item.urgency === 'medium' ? 'bg-orange-50 border-orange-100' : 'bg-blue-50 border-blue-100'
                        }`}>
                          <div className="flex justify-between items-start mb-2">
                             <h5 className="font-bold text-slate-900 text-sm">{item.product}</h5>
                             <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                               item.urgency === 'high' ? 'bg-red-200 text-red-700' : 
                               item.urgency === 'medium' ? 'bg-orange-200 text-orange-700' : 'bg-blue-200 text-blue-700'
                             }`}>
                               {item.urgency}
                             </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Estimated: {item.days_remaining} days left</span>
                          </div>
                          <button className="w-full mt-3 py-2 bg-white rounded-lg text-slate-700 text-xs font-bold border border-slate-200 hover:border-[var(--color-mumz-pink)] hover:text-[var(--color-mumz-pink)] transition-all">
                            Add to Cart
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-[var(--color-mumz-light)] p-6 rounded-3xl border border-pink-100">
                  <h5 className="font-bold text-[var(--color-mumz-pink)] mb-2">AI Insights</h5>
                  <p className="text-xs text-pink-800 leading-relaxed">
                    Mumzworld AI analyzes purchase frequency, typical product usage rates, and developmental milestones to proactively suggest what your baby needs next. 
                  </p>
                  <div className="mt-4 pt-4 border-t border-pink-200 flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[var(--color-mumz-pink)]">
                      <Baby className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-pink-400">DEVELOPMENTAL TRACK</div>
                      <div className="text-xs font-bold text-pink-900 capitalize">{result.baby_stage.replaceAll('_', ' ')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
              <Layers className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-400 font-medium">Select a profile above to start the analysis.</p>
            </div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-20 py-10 bg-white border-t border-slate-200 text-center">
        <p className="text-slate-400 text-sm">© 2026 Mumzworld BabyTrack AI Dashboard. All rights reserved.</p>
      </footer>
    </div>
  );
}
