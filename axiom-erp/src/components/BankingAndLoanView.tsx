import React, { useState } from 'react';
import { BankAccount, LoanAccount, Transaction } from '../types';
import {
  Landmark,
  DollarSign,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Settings as SetIcon,
  ShieldCheck,
  CheckCircle,
  Smartphone,
  Users,
  Percent,
  TrendingUp,
  FileText,
  AlertTriangle,
} from 'lucide-react';

interface BankingAndLoanViewProps {
  bankAccounts: BankAccount[];
  loanAccounts: LoanAccount[];
  transactions: Transaction[];
  currentTab: 'banking' | 'loan' | 'settings';
  activeSubTab?: string;
  onAddBankAccount: (bank: Omit<BankAccount, 'id' | 'balance'>) => void;
  onAddLoan: (loan: Omit<LoanAccount, 'id' | 'accountNo' | 'disbursedAmount' | 'outstandingAmount' | 'status'>) => void;
}

export default function BankingAndLoanView({
  bankAccounts,
  loanAccounts,
  transactions,
  currentTab,
  activeSubTab,
  onAddBankAccount,
  onAddLoan,
}: BankingAndLoanViewProps) {
  // --- SUB-TAB ROUTERS ---
  const subTab = activeSubTab || (currentTab === 'loan' ? 'loan_accounts' : 'bank_accounts');

  // --- LOCAL MUTABLE STATS ---
  const [localBanks, setLocalBanks] = useState<BankAccount[]>(bankAccounts);
  const [localLoans, setLocalLoans] = useState<LoanAccount[]>(loanAccounts);
  const [localTxs, setLocalTxs] = useState<Transaction[]>(transactions);

  const [mobileWallets, setMobileWallets] = useState([
    { name: 'bKash Merchant Wallet', provider: 'bKash', number: '01712-940129', balance: 145000, status: 'Active' },
    { name: 'Nagad Business Pay', provider: 'Nagad', number: '01815-402910', balance: 82000, status: 'Active' },
    { name: 'Rocket Corp Wallet', provider: 'Rocket', number: '01911-301291', balance: 12500, status: 'Active' },
  ]);

  // --- GENERAL FORM MODAL ON/OFF ---
  const [showBankModal, setShowBankModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);

  // --- FORM VALUES ---
  // Bank Form
  const [bName, setBName] = useState('');
  const [bAccName, setBAccName] = useState('');
  const [bAccNo, setBAccNo] = useState('');
  const [bType, setBType] = useState<BankAccount['type']>('Current');

  // Loan Form
  const [lBorrower, setLBorrower] = useState('');
  const [lAmt, setLAmt] = useState('');
  const [lInt, setLInt] = useState('9');
  const [lDur, setLDur] = useState('12');

  // Deposit / Withdrawal Forms
  const [txTargetBank, setTxTargetBank] = useState(bankAccounts[0]?.id || '');
  const [txAmount, setTxAmount] = useState('');
  const [txDesc, setTxDesc] = useState('');

  // Transfer Form
  const [xfrFrom, setXfrFrom] = useState(bankAccounts[0]?.id || '');
  const [xfrTo, setXfrTo] = useState(bankAccounts[1]?.id || '');
  const [xfrAmt, setXfrAmt] = useState('');

  // Party Transaction Form
  const [partyName, setPartyName] = useState('');
  const [partyRole, setPartyRole] = useState<'Customer' | 'Supplier'>('Customer');
  const [partyAmt, setPartyAmt] = useState('');
  const [partyBank, setPartyBank] = useState(bankAccounts[0]?.id || '');

  // Mobile Banking Form
  const [mobWalletIdx, setMobWalletIdx] = useState('0');
  const [mobTxType, setMobTxType] = useState<'Cash In' | 'Cash Out'>('Cash In');
  const [mobAmt, setMobAmt] = useState('');
  const [mobDesc, setMobDesc] = useState('');

  // Reconciliation Form
  const [reconBankId, setReconBankId] = useState(bankAccounts[0]?.id || '');
  const [reconStatementBal, setReconStatementBal] = useState('');
  const [reconMatched, setReconMatched] = useState<boolean | null>(null);

  // Repayments Form
  const [repayLoanId, setRepayLoanId] = useState(loanAccounts[0]?.id || '');
  const [repayAmt, setRepayAmt] = useState('');

  // --- HANDLERS ---
  const handleBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bName || !bAccName || !bAccNo) return;

    onAddBankAccount({
      bankName: bName,
      accountName: bAccName,
      accountNumber: bAccNo,
      type: bType,
    });

    const newBank: BankAccount = {
      id: `bank_dyn_${Date.now()}`,
      bankName: bName,
      accountName: bAccName,
      accountNumber: bAccNo,
      type: bType,
      balance: 0,
    };
    setLocalBanks([...localBanks, newBank]);

    setBName('');
    setBAccName('');
    setBAccNo('');
    setShowBankModal(false);
  };

  const handleLoanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lBorrower || !lAmt) return;

    onAddLoan({
      borrowerName: lBorrower,
      amount: parseFloat(lAmt),
      interestRate: parseFloat(lInt),
      durationMonths: parseInt(lDur),
    });

    const newLoan: LoanAccount = {
      id: `loan_dyn_${Date.now()}`,
      accountNo: `LN-${Math.floor(Math.random() * 9000) + 1000}`,
      borrowerName: lBorrower,
      amount: parseFloat(lAmt),
      disbursedAmount: 0,
      outstandingAmount: parseFloat(lAmt),
      interestRate: parseFloat(lInt),
      durationMonths: parseInt(lDur),
      status: 'Active',
    };
    setLocalLoans([...localLoans, newLoan]);

    setLBorrower('');
    setLAmt('');
    setShowLoanModal(false);
  };

  // Deposit Inward Handler
  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txTargetBank || !txAmount) return;
    const amt = parseFloat(txAmount);
    if (amt <= 0) return;

    setLocalBanks(prev => prev.map(b => b.id === txTargetBank ? { ...b, balance: b.balance + amt } : b));

    const selectedBank = localBanks.find(b => b.id === txTargetBank);
    const newTx: Transaction = {
      id: `tx_dyn_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      referenceNo: `DEP-JV-${1000 + localTxs.length}`,
      description: txDesc || 'Direct Cash Vault Deposit',
      category: 'Capital Inflow',
      amount: amt,
      type: 'Deposit',
      accountId: txTargetBank,
    };
    setLocalTxs([newTx, ...localTxs]);

    setTxAmount('');
    setTxDesc('');
    alert(`Successfully credited ৳${amt.toLocaleString()} to ${selectedBank?.accountName}`);
  };

  // Withdrawal Outward Handler
  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txTargetBank || !txAmount) return;
    const amt = parseFloat(txAmount);
    if (amt <= 0) return;

    const selectedBank = localBanks.find(b => b.id === txTargetBank);
    if (selectedBank && selectedBank.balance < amt) {
      alert(`Insufficient funds! Available balance is ৳${selectedBank.balance.toLocaleString()}`);
      return;
    }

    setLocalBanks(prev => prev.map(b => b.id === txTargetBank ? { ...b, balance: b.balance - amt } : b));

    const newTx: Transaction = {
      id: `tx_dyn_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      referenceNo: `WTH-JV-${1000 + localTxs.length}`,
      description: txDesc || 'Direct Cash Vault Withdrawal',
      category: 'Cash Withdrawal',
      amount: amt,
      type: 'Expense',
      accountId: txTargetBank,
    };
    setLocalTxs([newTx, ...localTxs]);

    setTxAmount('');
    setTxDesc('');
    alert(`Successfully withdrew ৳${amt.toLocaleString()} from ${selectedBank?.accountName}`);
  };

  // Internal Bank to Bank Transfer
  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!xfrFrom || !xfrTo || !xfrAmt || xfrFrom === xfrTo) {
      alert('Source and destination accounts must be different!');
      return;
    }
    const amt = parseFloat(xfrAmt);
    const sourceBank = localBanks.find(b => b.id === xfrFrom);
    if (sourceBank && sourceBank.balance < amt) {
      alert(`Insufficient funds in source account! Available is ৳${sourceBank.balance.toLocaleString()}`);
      return;
    }

    setLocalBanks(prev => prev.map(b => {
      if (b.id === xfrFrom) return { ...b, balance: b.balance - amt };
      if (b.id === xfrTo) return { ...b, balance: b.balance + amt };
      return b;
    }));

    const destBank = localBanks.find(b => b.id === xfrTo);
    const newTx: Transaction = {
      id: `tx_dyn_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      referenceNo: `TRF-JV-${1000 + localTxs.length}`,
      description: `Fund transfer from ${sourceBank?.accountName} to ${destBank?.accountName}`,
      category: 'Internal Transfer',
      amount: amt,
      type: 'Expense',
      accountId: xfrFrom,
    };
    setLocalTxs([newTx, ...localTxs]);

    setXfrAmt('');
    alert(`Fund transfer of ৳${amt.toLocaleString()} completed successfully.`);
  };

  // Party Transaction (Settling Vendor/Client ledger)
  const handlePartySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyName || !partyAmt || !partyBank) return;
    const amt = parseFloat(partyAmt);

    const bank = localBanks.find(b => b.id === partyBank);
    if (partyRole === 'Supplier' && bank && bank.balance < amt) {
      alert(`Insufficient funds in selected bank to pay supplier!`);
      return;
    }

    setLocalBanks(prev => prev.map(b => {
      if (b.id === partyBank) {
        return { ...b, balance: partyRole === 'Customer' ? b.balance + amt : b.balance - amt };
      }
      return b;
    }));

    const newTx: Transaction = {
      id: `tx_dyn_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      referenceNo: `PRT-JV-${1000 + localTxs.length}`,
      description: `Party Payment: ${partyRole === 'Customer' ? 'Inward from' : 'Outward to'} ${partyName}`,
      category: partyRole === 'Customer' ? 'Sales Income' : 'Cost of Goods Sold',
      amount: amt,
      type: partyRole === 'Customer' ? 'Deposit' : 'Expense',
      accountId: partyBank,
    };
    setLocalTxs([newTx, ...localTxs]);

    setPartyName('');
    setPartyAmt('');
    alert(`Successfully posted party transaction of ৳${amt.toLocaleString()} to ledger.`);
  };

  // Mobile Banking Wallet Transaction
  const handleMobileTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobAmt) return;
    const idx = parseInt(mobWalletIdx);
    const amt = parseFloat(mobAmt);
    const targetWallet = mobileWallets[idx];

    if (mobTxType === 'Cash Out' && targetWallet.balance < amt) {
      alert(`Insufficient wallet balance!`);
      return;
    }

    setMobileWallets(prev => prev.map((w, i) => {
      if (i === idx) {
        return { ...w, balance: mobTxType === 'Cash In' ? w.balance + amt : w.balance - amt };
      }
      return w;
    }));

    const newTx: Transaction = {
      id: `tx_dyn_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      referenceNo: `MOB-JV-${1000 + localTxs.length}`,
      description: mobDesc || `Mobile wallet ${mobTxType} on ${targetWallet.provider}`,
      category: 'Mobile Transaction',
      amount: amt,
      type: mobTxType === 'Cash In' ? 'Deposit' : 'Expense',
      accountId: 'mobile',
    };
    setLocalTxs([newTx, ...localTxs]);

    setMobAmt('');
    setMobDesc('');
    alert(`Successfully posted ৳${amt.toLocaleString()} ${mobTxType} transaction on ${targetWallet.name}`);
  };

  // Bank Reconciliation matching
  const handleReconSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reconStatementBal) return;
    const targetBank = localBanks.find(b => b.id === reconBankId);
    if (!targetBank) return;

    const stmtVal = parseFloat(reconStatementBal);
    const isMatched = Math.abs(targetBank.balance - stmtVal) < 0.01;
    setReconMatched(isMatched);
  };

  // Disburse Loan Payout
  const handleDisburse = (loanId: string) => {
    const loan = localLoans.find(l => l.id === loanId);
    if (!loan) return;

    // Credit one of our bank accounts (e.g. first bank account)
    if (localBanks.length > 0) {
      const bId = localBanks[0].id;
      setLocalBanks(prev => prev.map(b => b.id === bId ? { ...b, balance: b.balance + loan.amount } : b));
    }

    setLocalLoans(prev => prev.map(l => l.id === loanId ? { ...l, disbursedAmount: loan.amount, status: 'Disbursed' } : l));

    // Record dynamic transaction
    const newTx: Transaction = {
      id: `tx_dyn_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      referenceNo: `DSB-JV-${1000 + localTxs.length}`,
      description: `Disbursed loan capital from ${loan.borrowerName}`,
      category: 'Loan Disbursement Credit',
      amount: loan.amount,
      type: 'Deposit',
      accountId: localBanks[0]?.id || 'cash',
    };
    setLocalTxs([newTx, ...localTxs]);

    alert(`Successfully disbursed ৳${loan.amount.toLocaleString()} into corporate cash reserve account.`);
  };

  // Repay Loan Installment
  const handleRepaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repayAmt || !repayLoanId) return;
    const amt = parseFloat(repayAmt);

    const targetLoan = localLoans.find(l => l.id === repayLoanId);
    if (!targetLoan) return;

    if (amt > targetLoan.outstandingAmount) {
      alert(`Repayment amount cannot exceed remaining outstanding debt of ৳${targetLoan.outstandingAmount.toLocaleString()}`);
      return;
    }

    // Deduct from bank accounts
    if (localBanks.length > 0) {
      const bId = localBanks[0].id;
      setLocalBanks(prev => prev.map(b => b.id === bId ? { ...b, balance: b.balance - amt } : b));
    }

    setLocalLoans(prev => prev.map(l => l.id === repayLoanId ? { ...l, outstandingAmount: l.outstandingAmount - amt, status: l.outstandingAmount - amt <= 0 ? 'Closed' : 'Disbursed' } : l));

    // Record transaction
    const newTx: Transaction = {
      id: `tx_dyn_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      referenceNo: `RPY-JV-${1000 + localTxs.length}`,
      description: `Loan Repayment installment to ${targetLoan.borrowerName}`,
      category: 'Debt Amortization',
      amount: amt,
      type: 'Expense',
      accountId: localBanks[0]?.id || 'cash',
    };
    setLocalTxs([newTx, ...localTxs]);

    setRepayAmt('');
    alert(`Amortization payment of ৳${amt.toLocaleString()} recorded successfully.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* ========================================================
          BANKING TERMINALS & COGNATES
          ======================================================== */}
      {currentTab === 'banking' && (
        <div className="space-y-6">
          
          {/* 1. BANK ACCOUNTS VIEW */}
          {subTab === 'bank_accounts' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 font-display">Banking Terminals</h2>
                  <p className="text-xs text-slate-400 mt-1">Review ledger vault liquid balances and connected corporate bank accounts.</p>
                </div>
                <button
                  onClick={() => setShowBankModal(true)}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-md cursor-pointer transition-all"
                >
                  <Plus className="h-4 w-4" />
                  <span>Link Bank Account</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {localBanks.map((b) => (
                  <div key={b.id} className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600" />
                    <div className="flex items-start justify-between">
                      <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Landmark className="h-5 w-5" />
                      </div>
                      <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-slate-50 text-slate-500 border border-slate-100">
                        {b.type}
                      </span>
                    </div>
                    <div className="mt-4">
                      <h4 className="font-bold text-slate-800 text-sm">{b.accountName}</h4>
                      <p className="text-[10px] text-slate-400 font-mono font-semibold mt-0.5">{b.bankName} • {b.accountNumber}</p>
                    </div>
                    <div className="border-t border-slate-50 pt-4 mt-4 flex items-baseline justify-between">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Settled Balance</span>
                      <span className="text-base font-black text-slate-800 font-display">৳{b.balance.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. TRANSACTIONS LEDGER */}
          {subTab === 'transactions' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800 font-display">Bank Ledger Transactions</h2>
                <p className="text-xs text-slate-400 mt-1">Review comprehensive deposits, payments, withdrawals, and capital transfers.</p>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold bg-slate-50/50 uppercase tracking-wider">
                      <th className="py-3.5 px-6">Date</th>
                      <th className="py-3.5 px-6">Reference No</th>
                      <th className="py-3.5 px-6">Transaction Description</th>
                      <th className="py-3.5 px-6">Category Tag</th>
                      <th className="py-3.5 px-6 text-right">Inflow / Outflow</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {localTxs.slice().reverse().map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="py-3.5 px-6 text-slate-500 font-medium">{t.date || '2026-07-06'}</td>
                        <td className="py-3.5 px-6 font-mono font-bold text-indigo-600">{t.referenceNo || 'TRX-JV'}</td>
                        <td className="py-3.5 px-6 font-bold text-slate-800">{t.description}</td>
                        <td className="py-3.5 px-6 text-slate-500 font-semibold">{t.category}</td>
                        <td className="py-3.5 px-6 text-right font-black">
                          {t.type === 'Deposit' || t.type === 'Income' ? (
                            <span className="text-emerald-600 font-bold inline-flex items-center gap-1">
                              <ArrowUpRight className="h-3.5 w-3.5" />
                              <span>+৳{t.amount.toLocaleString()}</span>
                            </span>
                          ) : (
                            <span className="text-rose-600 font-bold inline-flex items-center gap-1">
                              <ArrowDownRight className="h-3.5 w-3.5" />
                              <span>-৳{t.amount.toLocaleString()}</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. DEPOSIT COGNATE */}
          {subTab === 'deposit' && (
            <div className="max-w-md mx-auto bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 font-display uppercase tracking-wide">Record Bank Deposit Inward</h3>
                <p className="text-xs text-slate-400 mt-1">Manually credit funds into one of your connected business bank terminal ledgers.</p>
              </div>

              <form onSubmit={handleDepositSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target Bank Account</label>
                  <select
                    value={txTargetBank} onChange={(e) => setTxTargetBank(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none cursor-pointer"
                  >
                    {localBanks.map(b => <option key={b.id} value={b.id}>{b.accountName} (৳{b.balance.toLocaleString()})</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Deposit Amount (৳) *</label>
                  <input
                    type="number" required min="1" placeholder="e.g. 50000" value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Inward Memo Description</label>
                  <input
                    type="text" placeholder="e.g. Capital injection from promoter" value={txDesc}
                    onChange={(e) => setTxDesc(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                >
                  Confirm Credit Deposit
                </button>
              </form>
            </div>
          )}

          {/* 4. WITHDRAWAL COGNATE */}
          {subTab === 'withdrawal' && (
            <div className="max-w-md mx-auto bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 font-display uppercase tracking-wide">Record Bank Withdrawal Outward</h3>
                <p className="text-xs text-slate-400 mt-1">Manually debit funds from connected corporate banks for vault cash replenishment.</p>
              </div>

              <form onSubmit={handleWithdrawalSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Source Bank Account</label>
                  <select
                    value={txTargetBank} onChange={(e) => setTxTargetBank(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none cursor-pointer"
                  >
                    {localBanks.map(b => <option key={b.id} value={b.id}>{b.accountName} (৳{b.balance.toLocaleString()})</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Withdrawal Amount (৳) *</label>
                  <input
                    type="number" required min="1" placeholder="e.g. 10000" value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none font-bold text-rose-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Outward Memo Description</label>
                  <input
                    type="text" placeholder="e.g. Petty cash replenishment" value={txDesc}
                    onChange={(e) => setTxDesc(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                >
                  Confirm Debit Withdrawal
                </button>
              </form>
            </div>
          )}

          {/* 5. BANK TRANSFERS COGNATE */}
          {subTab === 'transfers' && (
            <div className="max-w-md mx-auto bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 font-display uppercase tracking-wide">Internal Funds Transfer</h3>
                <p className="text-xs text-slate-400 mt-1">Move cash balances seamlessly between different linked company bank accounts.</p>
              </div>

              <form onSubmit={handleTransferSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">From (Debit Source)</label>
                    <select value={xfrFrom} onChange={(e) => setXfrFrom(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none cursor-pointer">
                      {localBanks.map(b => <option key={b.id} value={b.id}>{b.accountName} (৳{b.balance.toLocaleString()})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">To (Credit Dest)</label>
                    <select value={xfrTo} onChange={(e) => setXfrTo(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none cursor-pointer">
                      {localBanks.map(b => <option key={b.id} value={b.id}>{b.accountName} (৳{b.balance.toLocaleString()})</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Transfer Amount (৳) *</label>
                  <input
                    type="number" required min="1" placeholder="e.g. 5000" value={xfrAmt}
                    onChange={(e) => setXfrAmt(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none font-bold"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                >
                  Post Transfer Journal
                </button>
              </form>
            </div>
          )}

          {/* 6. PARTY TRANSACTIONS */}
          {subTab === 'party_transaction' && (
            <div className="max-w-md mx-auto bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 font-display uppercase tracking-wide">Client / Supplier Transactions</h3>
                <p className="text-xs text-slate-400 mt-1">Directly log customer collection inflows or vendor pay-outs into ledgers.</p>
              </div>

              <form onSubmit={handlePartySubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Party Role</label>
                    <select value={partyRole} onChange={(e) => setPartyRole(e.target.value as 'Customer' | 'Supplier')} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none cursor-pointer">
                      <option value="Customer">Customer Inflow (Credit)</option>
                      <option value="Supplier">Supplier Pay-out (Debit)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Settlement Channel</label>
                    <select value={partyBank} onChange={(e) => setPartyBank(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none cursor-pointer">
                      {localBanks.map(b => <option key={b.id} value={b.id}>{b.accountName}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Party / Entity Name *</label>
                  <input
                    type="text" required placeholder="e.g. Hasan Enterprise Ltd." value={partyName}
                    onChange={(e) => setPartyName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Settled Amount (৳) *</label>
                  <input
                    type="number" required min="1" placeholder="e.g. 15000" value={partyAmt}
                    onChange={(e) => setPartyAmt(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none font-bold"
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full py-2.5 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors ${partyRole === 'Customer' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}
                >
                  Record Party Ledger Settlement
                </button>
              </form>
            </div>
          )}

          {/* 7. MOBILE BANKING DIRECTORY */}
          {subTab === 'mobile_banking' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {mobileWallets.map((wallet, idx) => (
                  <div key={idx} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-2 h-full bg-indigo-500" />
                    <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                      <Smartphone className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded uppercase">{wallet.provider}</span>
                      <h4 className="font-bold text-slate-800 text-sm mt-1.5">{wallet.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{wallet.number}</p>
                      <p className="font-black text-slate-800 mt-2 text-sm">৳{wallet.balance.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="max-w-md mx-auto bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Post Mobile Wallet transaction</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Adjust wallet floats for instant Bkash/Nagad checkout reconciliations.</p>
                </div>

                <form onSubmit={handleMobileTxSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target Wallet</label>
                      <select value={mobWalletIdx} onChange={(e) => setMobWalletIdx(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none cursor-pointer">
                        {mobileWallets.map((w, i) => <option key={i} value={i}>{w.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Transaction Float</label>
                      <select value={mobTxType} onChange={(e) => setMobTxType(e.target.value as 'Cash In' | 'Cash Out')} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none cursor-pointer">
                        <option value="Cash In">Cash In (Credit Float)</option>
                        <option value="Cash Out">Cash Out (Debit Outflow)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Transaction Amount (৳) *</label>
                    <input
                      type="number" required min="1" placeholder="e.g. 5000" value={mobAmt}
                      onChange={(e) => setMobAmt(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Transaction Reference</label>
                    <input
                      type="text" placeholder="e.g. Bkash Wallet Cash-in Ref" value={mobDesc}
                      onChange={(e) => setMobDesc(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                  >
                    Confirm Mobile Wallet Float Update
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* 8. BANK RECONCILIATION */}
          {subTab === 'reconciliation' && (
            <div className="max-w-md mx-auto bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 font-display uppercase tracking-wide">Bank Ledger Reconciliation</h3>
                <p className="text-xs text-slate-400 mt-1">Cross-check system virtual ledger balance against real physical bank statement.</p>
              </div>

              <form onSubmit={handleReconSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Recon Account</label>
                  <select value={reconBankId} onChange={(e) => setReconBankId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none cursor-pointer">
                    {localBanks.map(b => <option key={b.id} value={b.id}>{b.accountName} (Ledger: ৳{b.balance.toLocaleString()})</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Statement Balance (৳) *</label>
                  <input
                    type="number" required placeholder="e.g. 50000" value={reconStatementBal}
                    onChange={(e) => setReconStatementBal(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none font-bold"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                >
                  Verify Bank Statement
                </button>
              </form>

              {reconMatched !== null && (
                <div className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-semibold animate-in fade-in duration-100 ${reconMatched ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-rose-50 text-rose-800 border-rose-100'}`}>
                  {reconMatched ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                      <p>Success! Ledgers match statement perfectly. Audit trails generated.</p>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
                      <p>Mismatch detected! Adjustment entry required for unresolved discrepancies.</p>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* ========================================================
          LOANS & DEBT SERVICING
          ======================================================== */}
      {currentTab === 'loan' && (
        <div className="space-y-6">
          
          {/* 1. LOAN ACCOUNTS VIEW */}
          {subTab === 'loan_accounts' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 font-display">Liability Loan Registry</h2>
                  <p className="text-xs text-slate-400 mt-1">Track company credit lines, staff advances, and monthly amortization schedules.</p>
                </div>
                <button
                  onClick={() => setShowLoanModal(true)}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-md cursor-pointer transition-all"
                >
                  <Plus className="h-4 w-4" />
                  <span>Record Liability Loan</span>
                </button>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold bg-slate-50/50 uppercase tracking-wider">
                      <th className="py-3.5 px-6">Amortization No</th>
                      <th className="py-3.5 px-6">Borrower Entity Name</th>
                      <th className="py-3.5 px-6 text-center">Interest / Duration</th>
                      <th className="py-3.5 px-6 text-right">Sanctioned Principal</th>
                      <th className="py-3.5 px-6 text-right">Disbursed Amount</th>
                      <th className="py-3.5 px-6 text-right">Outstanding Debt</th>
                      <th className="py-3.5 px-6 text-center">Current Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {localLoans.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="py-4 px-6 font-mono font-bold text-indigo-600">{l.accountNo}</td>
                        <td className="py-4 px-6 font-bold text-slate-800">{l.borrowerName}</td>
                        <td className="py-4 px-6 text-center font-semibold text-slate-500">
                          {l.interestRate}% Int. • {l.durationMonths} Mos.
                        </td>
                        <td className="py-4 px-6 text-right font-bold text-slate-500">৳{l.amount.toLocaleString()}</td>
                        <td className="py-4 px-6 text-right font-bold text-slate-600">৳{l.disbursedAmount.toLocaleString()}</td>
                        <td className="py-4 px-6 text-right font-black text-rose-600">৳{l.outstandingAmount.toLocaleString()}</td>
                        <td className="py-4 px-6 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${l.status === 'Disbursed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                            {l.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2. DISBURSEMENTS */}
          {subTab === 'disbursements' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800 font-display">Disbursement Actions</h2>
                <p className="text-xs text-slate-400 mt-1">Disburse sanctioned loan funds directly into connected active bank balances.</p>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold bg-slate-50/50 uppercase tracking-wider">
                      <th className="py-3.5 px-6">Loan Ref</th>
                      <th className="py-3.5 px-6">Lender Name</th>
                      <th className="py-3.5 px-6 text-right">sanctioned Capital</th>
                      <th className="py-3.5 px-6 text-center">Disbursed Ratio</th>
                      <th className="py-3.5 px-6 text-center">Disbursed Status</th>
                      <th className="py-3.5 px-6 text-right">Disbursement Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {localLoans.map((l) => {
                      const isDisbursed = l.disbursedAmount > 0;
                      return (
                        <tr key={l.id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="py-4 px-6 font-mono font-bold text-indigo-600">{l.accountNo}</td>
                          <td className="py-4 px-6 font-bold text-slate-800">{l.borrowerName}</td>
                          <td className="py-4 px-6 text-right font-black text-slate-800">৳{l.amount.toLocaleString()}</td>
                          <td className="py-4 px-6 text-center font-bold text-slate-600">
                            {isDisbursed ? '100% Fully Disbursed' : '0% Pending'}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${isDisbursed ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                              {isDisbursed ? 'Disbursed' : 'Sanctioned'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              disabled={isDisbursed}
                              onClick={() => handleDisburse(l.id)}
                              className={`px-3.5 py-1.5 font-bold rounded-lg text-[10px] cursor-pointer transition-colors ${isDisbursed ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                            >
                              {isDisbursed ? 'Disbursed' : 'Release Capital'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. REPAYMENTS */}
          {subTab === 'repayments' && (
            <div className="max-w-md mx-auto bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 font-display uppercase tracking-wide">Amortization Installments Repayment</h3>
                <p className="text-xs text-slate-400 mt-1">Settle outstanding debt installments with direct corporate bank debits.</p>
              </div>

              <form onSubmit={handleRepaySubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Select Credit Line</label>
                  <select value={repayLoanId} onChange={(e) => setRepayLoanId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none cursor-pointer text-slate-700">
                    {localLoans.filter(l => l.outstandingAmount > 0).map(l => (
                      <option key={l.id} value={l.id}>{l.borrowerName} (Debt: ৳{l.outstandingAmount.toLocaleString()})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Repayment Installment Amount (৳) *</label>
                  <input
                    type="number" required min="1" placeholder="e.g. 25000" value={repayAmt}
                    onChange={(e) => setRepayAmt(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none font-bold text-rose-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                >
                  Post Repayment installment
                </button>
              </form>
            </div>
          )}

          {/* 4. LOAN REPORTS */}
          {subTab === 'loan_report' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800 font-display">Aggregate Loan Debt Analytics</h2>
                <p className="text-xs text-slate-400 mt-1">Audit company debt-to-equity ratios, total accrued interest liability, and outstanding capital.</p>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-semibold">
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Accrued Sanctioned Capital</span>
                    <span className="text-lg font-bold text-slate-800 mt-2 block">
                      ৳{localLoans.reduce((sum, l) => sum + l.amount, 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Released Payout Float</span>
                    <span className="text-lg font-bold text-indigo-600 mt-2 block">
                      ৳{localLoans.reduce((sum, l) => sum + l.disbursedAmount, 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-5">
                    <span className="text-[10px] font-bold uppercase text-rose-500 block">Total Outstanding Debt Liability</span>
                    <span className="text-lg font-bold text-rose-700 mt-2 block">
                      ৳{localLoans.reduce((sum, l) => sum + l.outstandingAmount, 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================
          Axiom SYSTEM CONFIG SETTINGS
          ======================================================== */}
      {currentTab === 'settings' && (
        <div className="max-w-2xl mx-auto bg-white border border-slate-200/80 p-8 rounded-2xl shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <SetIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 font-display uppercase tracking-wide">Axiom General Settings</h3>
              <p className="text-xs text-slate-400">Configure corporate branch profiles, standard tax categories, and database logs.</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Company Registered Name</label>
                <input
                  type="text" disabled value="M/S Madani Traders"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-500 rounded-lg p-2.5 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">System Base Currency</label>
                <input
                  type="text" disabled value="BDT (৳) — Bangladesh Taka"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-500 rounded-lg p-2.5 text-xs font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">POS Billing Terminal Printer</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs cursor-not-allowed" disabled>
                  <option>Thermal Receipt Printer 80mm (USB-A/LAN)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Default POS VAT Tax Rate</label>
                <input
                  type="text" disabled value="5% Flat VAT Category"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-500 rounded-lg p-2.5 text-xs font-bold"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 my-4 pt-4 flex items-center gap-3 text-[11px] text-slate-400">
              <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
              <p className="font-medium leading-relaxed">
                Security Policy: Double-entry account records, employees history tracking, and inventory ledgers are compiled on local cache. Backups are stored inside standard encrypted sandboxes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Linked Bank Modal */}
      {showBankModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Link Business Bank Account</h3>
              <button onClick={() => setShowBankModal(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleBankSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Bank Name *</label>
                <input
                  type="text" required placeholder="e.g. Mutual Trust Bank PLC" value={bName}
                  onChange={(e) => setBName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Account Display Name *</label>
                <input
                  type="text" required placeholder="e.g. MTB General Current" value={bAccName}
                  onChange={(e) => setBAccName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Account Number *</label>
                <input
                  type="text" required placeholder="e.g. 1102.1129.401" value={bAccNo}
                  onChange={(e) => setBAccNo(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Account Type</label>
                <select value={bType} onChange={(e) => setBType(e.target.value as BankAccount['type'])} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none cursor-pointer">
                  <option value="Current">Current Account</option>
                  <option value="Savings">Savings Account</option>
                  <option value="Mobile">Mobile Banking</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowBankModal(false)} className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg text-xs hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer">Link Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Loan Modal */}
      {showLoanModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Record New Liability Loan</h3>
              <button onClick={() => setShowLoanModal(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleLoanSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Borrowing Entity Name *</label>
                <input
                  type="text" required placeholder="e.g. DBBL Corporate Loan" value={lBorrower}
                  onChange={(e) => setLBorrower(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Loan Capital Amount (৳) *</label>
                <input
                  type="number" required min="100" placeholder="500000" value={lAmt}
                  onChange={(e) => setLAmt(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Interest Rate (%)</label>
                  <input
                    type="number" min="0" max="100" placeholder="9" value={lInt}
                    onChange={(e) => setLInt(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-center"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Amortization Months</label>
                  <input
                    type="number" min="1" placeholder="12" value={lDur}
                    onChange={(e) => setLDur(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-center"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowLoanModal(false)} className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg text-xs hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer">Sanction Loan</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
