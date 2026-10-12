import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  History,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { formatSwissCHF, formatSwissDate } from '../../utils/swissQr';

export const PointCardManager: React.FC = () => {
  const {
    pointCards,
    pointCardTxs,
    students,
    classes,
    issuePointCard,
    redeemPoint
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [selectedCardIdForRedeem, setSelectedCardIdForRedeem] = useState<string>('');
  const [selectedClassForRedeem, setSelectedClassForRedeem] = useState<string>(classes[0]?.name || 'Drop-In Dance');

  // Issue modal fields
  const [studentId, setStudentId] = useState<string>(students[0]?.id || '');
  const [cardType, setCardType] = useState<'5-Class Pass' | '10-Class Pass' | '20-Class Pass'>('10-Class Pass');

  const cardConfig = {
    '5-Class Pass': { points: 5, price: 150 },
    '10-Class Pass': { points: 10, price: 280 },
    '20-Class Pass': { points: 20, price: 520 },
  };

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const stu = students.find(s => s.id === studentId);
    if (!stu) return;

    const conf = cardConfig[cardType];
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + 6); // 6 months validity

    issuePointCard({
      studentId: stu.id,
      studentName: `${stu.firstName} ${stu.lastName}`,
      cardType,
      totalPoints: conf.points,
      remainingPoints: conf.points,
      purchaseDate: new Date().toISOString().split('T')[0],
      expiryDate: expiry.toISOString().split('T')[0],
      priceCHF: conf.price,
      status: 'active'
    });

    setShowIssueModal(false);
  };

  const handleRedeemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const card = pointCards.find(c => c.id === selectedCardIdForRedeem);
    if (!card) return;

    redeemPoint(card.id, selectedClassForRedeem, card.studentId);
    setShowRedeemModal(false);
  };

  const filteredCards = pointCards.filter(c => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return c.cardCode.toLowerCase().includes(q) || c.studentName.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Point Cards & Drop-In Passes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage prepaid 5, 10, and 20 class punch-cards with live deduction ledgers and expiration dates.
          </p>
        </div>

        <button
          onClick={() => setShowIssueModal(true)}
          className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-md shadow-violet-600/20 transition flex items-center gap-1.5 active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Issue Point Card</span>
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCards.map(card => {
          const percent = (card.remainingPoints / card.totalPoints) * 100;
          const isLow = card.remainingPoints <= 2 && card.remainingPoints > 0;
          const isExhausted = card.remainingPoints === 0;

          return (
            <div
              key={card.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-mono font-bold text-slate-900 text-sm">{card.cardCode}</span>
                      <p className="text-[11px] text-slate-400">{card.cardType}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                    isExhausted ? 'bg-slate-100 text-slate-500' :
                    isLow ? 'bg-amber-100 text-amber-800' :
                    'bg-emerald-100 text-emerald-800'
                  }`}>
                    {card.status}
                  </span>
                </div>

                <div className="mt-4">
                  <h4 className="font-bold text-slate-900 text-base">{card.studentName}</h4>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-2xl font-bold font-mono text-violet-600">
                      {card.remainingPoints} <span className="text-xs text-slate-400 font-normal">/ {card.totalPoints} pts</span>
                    </span>
                    <span className="font-mono text-xs text-slate-600">
                      CHF {formatSwissCHF(card.priceCHF)}
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isLow ? 'bg-amber-500' : isExhausted ? 'bg-slate-400' : 'bg-violet-600'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 space-y-1">
                  <p>Purchased: {formatSwissDate(card.purchaseDate)}</p>
                  <p>Valid until: <strong className="text-slate-700">{formatSwissDate(card.expiryDate)}</strong></p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  disabled={card.remainingPoints <= 0}
                  onClick={() => {
                    setSelectedCardIdForRedeem(card.id);
                    setShowRedeemModal(true);
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold transition ${
                    card.remainingPoints > 0
                      ? 'bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Redeem 1 Point
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Global Transaction Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-violet-600" />
            <h3 className="font-bold text-sm text-slate-900">Audit Ledger & Redemptions</h3>
          </div>
          <span className="text-xs text-slate-400">{pointCardTxs.length} historical events</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Student</th>
                <th className="py-2.5 px-4">Event Type</th>
                <th className="py-2.5 px-4">Description / Class</th>
                <th className="py-2.5 px-4">Staff</th>
                <th className="py-2.5 px-4 text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {pointCardTxs.map(tx => {
                const stu = students.find(s => s.id === tx.studentId);
                return (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono-num text-slate-500">
                      {formatSwissDate(tx.date.split('T')[0])}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {stu ? `${stu.firstName} ${stu.lastName}` : 'Dancer'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        tx.type === 'purchase' ? 'bg-emerald-100 text-emerald-800' :
                        tx.type === 'redemption' ? 'bg-violet-100 text-violet-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{tx.reason}</td>
                    <td className="py-3 px-4 text-slate-500">{tx.recordedBy}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      <span className={tx.points > 0 ? 'text-emerald-600' : 'text-slate-800'}>
                        {tx.points > 0 ? `+${tx.points}` : tx.points} pts
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 text-xs">
            <h3 className="font-bold text-base text-slate-900">Issue New Point Card</h3>
            <form onSubmit={handleIssueSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student</label>
                <select
                  value={studentId}
                  onChange={e => setStudentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.studentId})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Card Package</label>
                <select
                  value={cardType}
                  onChange={e => setCardType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                >
                  <option value="5-Class Pass">5-Class Pass — CHF 150.00</option>
                  <option value="10-Class Pass">10-Class Pass — CHF 280.00 (Standard)</option>
                  <option value="20-Class Pass">20-Class Pass — CHF 520.00</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow-md"
                >
                  Issue Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Redeem Modal */}
      {showRedeemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 text-xs">
            <h3 className="font-bold text-base text-slate-900">Redeem 1 Dance Class Point</h3>
            <form onSubmit={handleRedeemSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Attended Class</label>
                <select
                  value={selectedClassForRedeem}
                  onChange={e => setSelectedClassForRedeem(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRedeemModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md"
                >
                  Confirm Redemption (-1 pt)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
