import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import InventoryView from './components/InventoryView';
import SalesView from './components/SalesView';
import PurchaseView from './components/PurchaseView';
import EmployeeView from './components/EmployeeView';
import AccountingView from './components/AccountingView';
import BankingAndLoanView from './components/BankingAndLoanView';

import {
  Product,
  Customer,
  Supplier,
  Invoice,
  PurchaseOrder,
  BankAccount,
  Transaction,
  AccountHead,
  Employee,
  Attendance,
  LoanAccount,
} from './types';

import {
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_SUPPLIERS,
  INITIAL_INVOICES,
  INITIAL_PO,
  INITIAL_BANK_ACCOUNTS,
  INITIAL_TRANSACTIONS,
  INITIAL_ACCOUNT_HEADS,
  INITIAL_EMPLOYEES,
  INITIAL_ATTENDANCE,
  INITIAL_LOANS,
} from './data';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [currentSubTab, setCurrentSubTab] = useState('');

  // Core shared state engines
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(INITIAL_PO);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(INITIAL_BANK_ACCOUNTS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [accountHeads, setAccountHeads] = useState<AccountHead[]>(INITIAL_ACCOUNT_HEADS);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [attendances, setAttendances] = useState<Attendance[]>(INITIAL_ATTENDANCE);
  const [loanAccounts, setLoanAccounts] = useState<LoanAccount[]>(INITIAL_LOANS);

  // --- STATE MUTATION HANDLERS ---

  // INVENTORY MUTATORS
  const handleAddProduct = (newProd: Omit<Product, 'id'>) => {
    const p: Product = {
      ...newProd,
      id: `p_dynamic_${Date.now()}`,
    };
    setProducts((prev) => [...prev, p]);
  };

  const handleEditStock = (productId: string, newStockVal: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: newStockVal } : p))
    );
  };

  // CUSTOMER MUTATORS
  const handleAddCustomer = (newCust: Omit<Customer, 'id' | 'outstandingBalance'>) => {
    const c: Customer = {
      ...newCust,
      id: `c_dynamic_${Date.now()}`,
      outstandingBalance: 0,
    };
    setCustomers((prev) => [...prev, c]);
  };

  const handleRecordCollection = (customerId: string, amount: number) => {
    // 1. Subtract from customer outstanding
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? { ...c, outstandingBalance: Math.max(0, c.outstandingBalance - amount) }
          : c
      )
    );

    const targetCustomer = customers.find((c) => c.id === customerId);
    if (!targetCustomer) return;

    // 2. Deposit into bank account (Default to first cash account)
    setBankAccounts((prev) =>
      prev.map((b, idx) => (idx === 0 ? { ...b, balance: b.balance + amount } : b))
    );

    // 3. Log transaction ledger entry
    const newTx: Transaction = {
      id: `tx_dynamic_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      description: `Collection receipt from ${targetCustomer.name}`,
      type: 'Deposit',
      amount: amount,
      accountId: bankAccounts[0]?.id || 'b1',
      category: 'Dues Collection',
      referenceNo: `REC-${Date.now().toString().slice(-4)}`,
    };
    setTransactions((prev) => [...prev, newTx]);

    // 4. Update ledger accounts balances
    setAccountHeads((prev) =>
      prev.map((ah) => {
        if (ah.code === '1010') {
          // Cash in Hand
          return { ...ah, balance: ah.balance + amount };
        }
        if (ah.code === '1030') {
          // Accounts Receivable
          return { ...ah, balance: Math.max(0, ah.balance - amount) };
        }
        return ah;
      })
    );
  };

  // SALES / POS MUTATORS
  const handleAddInvoice = (newInvoice: Invoice) => {
    // 1. Append invoice
    setInvoices((prev) => [...prev, newInvoice]);

    // 2. Subtract product stocks
    setProducts((prev) =>
      prev.map((p) => {
        const soldItem = newInvoice.items.find((it) => it.productId === p.id);
        if (soldItem) {
          return { ...p, stock: Math.max(0, p.stock - soldItem.quantity) };
        }
        return p;
      })
    );

    // 3. Add to accounts / transactions depending on payment method
    if (newInvoice.paymentMethod === 'Credit') {
      // Add outstanding credit to customer
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === newInvoice.customerId
            ? { ...c, outstandingBalance: c.outstandingBalance + newInvoice.total }
            : c
        )
      );

      // Log transaction as Deposit but with pending payment method indicator
      const newTx: Transaction = {
        id: `tx_dynamic_${Date.now()}`,
        date: newInvoice.date,
        description: `Credit sale matching invoice ${newInvoice.invoiceNo}`,
        type: 'Deposit',
        amount: newInvoice.total,
        accountId: 'b1', // references Cash in Hand
        category: 'Sales Income',
        referenceNo: newInvoice.invoiceNo,
      };
      setTransactions((prev) => [...prev, newTx]);

      // Update Chart of accounts
      setAccountHeads((prev) =>
        prev.map((ah) => {
          if (ah.code === '1030') {
            // Accounts Receivable increases
            return { ...ah, balance: ah.balance + newInvoice.total };
          }
          if (ah.code === '4010') {
            // Sales Revenue increases
            return { ...ah, balance: ah.balance + newInvoice.total };
          }
          return ah;
        })
      );
    } else {
      // Cash/Mobile Deposit instantly
      const targetBankIdx = newInvoice.paymentMethod === 'Mobile Banking' ? 2 : 0; // index of bank to deposit
      setBankAccounts((prev) =>
        prev.map((b, idx) =>
          idx === targetBankIdx ? { ...b, balance: b.balance + newInvoice.total } : b
        )
      );

      const newTx: Transaction = {
        id: `tx_dynamic_${Date.now()}`,
        date: newInvoice.date,
        description: `${newInvoice.paymentMethod} sale matching invoice ${newInvoice.invoiceNo}`,
        type: 'Deposit',
        amount: newInvoice.total,
        accountId: bankAccounts[targetBankIdx]?.id || 'b1',
        category: 'Sales Income',
        referenceNo: newInvoice.invoiceNo,
      };
      setTransactions((prev) => [...prev, newTx]);

      // Update Chart of accounts
      setAccountHeads((prev) =>
        prev.map((ah) => {
          if (ah.code === '1010') {
            // Cash in Hand increases
            return { ...ah, balance: ah.balance + newInvoice.total };
          }
          if (ah.code === '4010') {
            // Sales Revenue increases
            return { ...ah, balance: ah.balance + newInvoice.total };
          }
          return ah;
        })
      );
    }
  };

  // PURCHASE MUTATORS
  const handleAddSupplier = (newSup: Omit<Supplier, 'id' | 'outstandingBalance'>) => {
    const s: Supplier = {
      ...newSup,
      id: `s_dynamic_${Date.now()}`,
      outstandingBalance: 0,
    };
    setSuppliers((prev) => [...prev, s]);
  };

  const handleAddPurchaseOrder = (newPO: PurchaseOrder) => {
    setPurchaseOrders((prev) => [...prev, newPO]);
  };

  const handleReceivePurchaseOrder = (poId: string) => {
    const po = purchaseOrders.find((p) => p.id === poId);
    if (!po) return;

    // 1. Change PO status
    setPurchaseOrders((prev) =>
      prev.map((p) => (p.id === poId ? { ...p, status: 'Received' as const } : p))
    );

    // 2. Replenish inventory product stocks
    setProducts((prev) =>
      prev.map((p) => {
        const item = po.items.find((line) => line.productId === p.id);
        if (item) {
          return { ...p, stock: p.stock + item.quantity };
        }
        return p;
      })
    );

    // 3. Increase Supplier outstanding balance (Payables credit ledger)
    setSuppliers((prev) =>
      prev.map((s) =>
        s.id === po.supplierId ? { ...s, outstandingBalance: s.outstandingBalance + po.total } : s
      )
    );

    // 4. Log Cost transaction ledger
    const newTx: Transaction = {
      id: `tx_dynamic_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      description: `Replenished product inventory matching PO ${po.poNo}`,
      type: 'Withdrawal',
      amount: po.total,
      accountId: 'b1',
      category: 'Cost of Goods Sold',
      referenceNo: po.poNo,
    };
    setTransactions((prev) => [...prev, newTx]);

    // 5. Update chart of accounts (Accounts Payable and Cost of Goods Sold)
    setAccountHeads((prev) =>
      prev.map((ah) => {
        if (ah.code === '2010') {
          // Accounts Payable increases
          return { ...ah, balance: ah.balance + po.total };
        }
        if (ah.code === '5010') {
          // Cost of Goods Sold increases
          return { ...ah, balance: ah.balance + po.total };
        }
        return ah;
      })
    );
  };

  // HRM MUTATORS
  const handleAddEmployee = (newEmp: Omit<Employee, 'id'>) => {
    const e: Employee = {
      ...newEmp,
      id: `e_dynamic_${Date.now()}`,
    };
    setEmployees((prev) => [...prev, e]);
  };

  const handleUpdateAttendance = (employeeId: string, status: Attendance['status']) => {
    const targetEmployee = employees.find((e) => e.id === employeeId);
    if (!targetEmployee) return;

    const todayDate = new Date().toISOString().split('T')[0];

    setAttendances((prev) => {
      const existing = prev.find((a) => a.employeeId === employeeId && a.date === todayDate);
      if (existing) {
        return prev.map((a) =>
          a.employeeId === employeeId && a.date === todayDate
            ? {
                ...a,
                status,
                checkIn: status === 'Present' ? '08:50 AM' : status === 'Late' ? '09:25 AM' : '—',
                checkOut: status === 'Present' || status === 'Late' ? '05:00 PM' : '—',
              }
            : a
        );
      } else {
        const newAtt: Attendance = {
          id: `att_dynamic_${Date.now()}`,
          employeeId,
          employeeName: targetEmployee.name,
          date: todayDate,
          status,
          checkIn: status === 'Present' ? '08:50 AM' : status === 'Late' ? '09:25 AM' : '—',
          checkOut: status === 'Present' || status === 'Late' ? '05:00 PM' : '—',
        };
        return [...prev, newAtt];
      }
    });
  };

  // BANKING & LOAN MUTATORS
  const handleAddBankAccount = (newBank: Omit<BankAccount, 'id' | 'balance'>) => {
    const b: BankAccount = {
      ...newBank,
      id: `b_dynamic_${Date.now()}`,
      balance: 0,
    };
    setBankAccounts((prev) => [...prev, b]);
  };

  const handleAddLoan = (newLoan: Omit<LoanAccount, 'id' | 'accountNo' | 'disbursedAmount' | 'outstandingAmount' | 'status'>) => {
    const accountNo = `LN-DBBL-2026-${400 + loanAccounts.length}`;
    const l: LoanAccount = {
      ...newLoan,
      id: `l_dynamic_${Date.now()}`,
      accountNo,
      disbursedAmount: newLoan.amount,
      outstandingAmount: newLoan.amount,
      status: 'Active',
    };
    setLoanAccounts((prev) => [...prev, l]);
  };

  const handleLogTransaction = (tx: Omit<Transaction, 'id' | 'date'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx_dynamic_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    setTransactions((prev) => [...prev, newTx]);

    // Deduct or deposit from bank account
    setBankAccounts((prev) =>
      prev.map((b) => {
        if (b.id === tx.accountId) {
          const delta = tx.type === 'Deposit' || tx.type === 'Income' ? tx.amount : -tx.amount;
          return { ...b, balance: b.balance + delta };
        }
        return b;
      })
    );

    // Update Chart of accounts balances
    setAccountHeads((prev) =>
      prev.map((ah) => {
        if (ah.code === '1010') {
          // Cash in Hand adjusted
          const delta = tx.type === 'Deposit' || tx.type === 'Income' ? tx.amount : -tx.amount;
          return { ...ah, balance: ah.balance + delta };
        }
        return ah;
      })
    );
  };

  // Handle high-level shortcut routing from Dashboard view
  const handleTabChange = (tab: string, subTab: string = '') => {
    setCurrentTab(tab);
    setCurrentSubTab(subTab);
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-700 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar currentTab={currentTab} currentSubTab={currentSubTab} onTabChange={handleTabChange} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header bar with Clock */}
        <Header currentTab={currentTab} currentSubTab={currentSubTab} onTabChange={handleTabChange} />

        {/* Dynamic content render views */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          {currentTab === 'dashboard' && (
            <DashboardView
              products={products}
              customers={customers}
              invoices={invoices}
              suppliers={suppliers}
              onTabChange={handleTabChange}
            />
          )}

          {currentTab === 'inventory' && (
            <InventoryView
              products={products}
              onAddProduct={handleAddProduct}
              onUpdateStock={handleEditStock}
              onDeleteProduct={(id) => setProducts((prev) => prev.filter((p) => p.id !== id))}
              activeSubTab={currentSubTab}
              onUpdateProducts={setProducts}
            />
          )}

          {currentTab === 'sales' && (
            <SalesView
              products={products}
              customers={customers}
              invoices={invoices}
              onAddInvoice={handleAddInvoice}
              onAddCustomer={handleAddCustomer}
              onRecordCollection={handleRecordCollection}
              activeSubTab={currentSubTab}
            />
          )}

          {currentTab === 'purchase' && (
            <PurchaseView
              suppliers={suppliers}
              purchaseOrders={purchaseOrders}
              products={products}
              onAddSupplier={handleAddSupplier}
              onAddPurchaseOrder={handleAddPurchaseOrder}
              onReceivePurchaseOrder={handleReceivePurchaseOrder}
              activeSubTab={currentSubTab}
            />
          )}

          {currentTab === 'employee' && (
            <EmployeeView
              employees={employees}
              attendances={attendances}
              onAddEmployee={handleAddEmployee}
              onUpdateAttendance={handleUpdateAttendance}
              activeSubTab={currentSubTab}
            />
          )}

          {currentTab === 'accounting' && (
            <AccountingView
              accountHeads={accountHeads}
              transactions={transactions}
              bankAccounts={bankAccounts}
              onLogTransaction={handleLogTransaction}
              activeSubTab={currentSubTab}
            />
          )}

          {(currentTab === 'banking' || currentTab === 'loan' || currentTab === 'settings') && (
            <BankingAndLoanView
              bankAccounts={bankAccounts}
              loanAccounts={loanAccounts}
              transactions={transactions}
              currentTab={currentTab as 'banking' | 'loan' | 'settings'}
              activeSubTab={currentSubTab}
              onAddBankAccount={handleAddBankAccount}
              onAddLoan={handleAddLoan}
            />
          )}

          {/* Quick empty fallback screen for other secondary/reports links to prevent app crashes */}
          {!['dashboard', 'inventory', 'sales', 'purchase', 'employee', 'accounting', 'banking', 'loan', 'settings'].includes(
            currentTab
          ) && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4 shadow-sm">
              <span className="text-4xl">📊</span>
              <h3 className="font-bold text-slate-800 text-sm font-display uppercase tracking-wide">
                Interactive Analytical Module
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                The requested sub-report is compiled dynamically on our cloud-ledger engine. Use the core operational screens in the sidebar to buy standard stock items, run checkouts, track staff check-ins, or check real-time P&L margins.
              </p>
              <button
                onClick={() => handleTabChange('dashboard')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Return to Dashboard View
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
