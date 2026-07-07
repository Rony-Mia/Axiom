import React, { useState } from 'react';
import {
  LayoutDashboard,
  Boxes,
  ShoppingCart,
  Store,
  Landmark,
  BookOpen,
  DollarSign,
  BarChart3,
  Grid,
  FileText,
  Settings,
  Users,
  Wallet,
  ChevronDown,
  ChevronRight,
  Search,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  currentSubTab: string;
  onTabChange: (tab: string, subTab?: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems: { id: string; label: string }[];
}

export default function Sidebar({ currentTab, currentSubTab, onTabChange }: SidebarProps) {
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    inventory: false,
    purchase: false,
    sales: true, // Default open sales to show high visual fidelity
    banking: false,
    accounting: false,
    loan: false,
    reports: false,
    gridReport: false,
    rdlReport: false,
    settings: false,
    employee: false,
    salary: false,
  });

  const [searchQuery, setSearchQuery] = useState('');

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      subItems: [],
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: Boxes,
      subItems: [
        { id: 'products', label: 'Products' },
        { id: 'categories', label: 'Categories' },
        { id: 'units', label: 'Units' },
        { id: 'warehouses', label: 'Warehouses' },
        { id: 'stock', label: 'Stock' },
        { id: 'stock_transfer', label: 'Stock Transfer' },
        { id: 'barcodes', label: 'Barcodes' },
        { id: 'offer_info', label: 'Offer Info' },
      ],
    },
    {
      id: 'purchase',
      label: 'Purchase',
      icon: ShoppingCart,
      subItems: [
        { id: 'suppliers', label: 'Suppliers' },
        { id: 'supplier_groups', label: 'Suppliers Groups' },
        { id: 'purchase_orders', label: 'Purchase Orders' },
        { id: 'goods_receipt', label: 'Goods Receipt' },
        { id: 'purchase_returns', label: 'Purchase Returns' },
        { id: 'purchase_payments', label: 'Payment' },
      ],
    },
    {
      id: 'sales',
      label: 'Sales',
      icon: Store,
      subItems: [
        { id: 'pos', label: 'Point of Sale' },
        { id: 'sale_orders', label: 'Sale Orders' },
        { id: 'invoices', label: 'Invoices' },
        { id: 'returns', label: 'Returns' },
        { id: 'collection', label: 'Collection' },
        { id: 'customers', label: 'Customers' },
        { id: 'customer_groups', label: 'Customer Groups' },
        { id: 'marketing_officer', label: 'Marketing Officer' },
        { id: 'due_report', label: 'Due Payment Report' },
        { id: 'client_expense', label: 'Client Expense' },
        { id: 'red_list_customers', label: 'Red List Customers' },
        { id: 'product_wise_report', label: 'Product wise Report' },
      ],
    },
    {
      id: 'banking',
      label: 'Banking',
      icon: Landmark,
      subItems: [
        { id: 'bank_accounts', label: 'Bank Accounts' },
        { id: 'transactions', label: 'Transactions' },
        { id: 'deposit', label: 'Deposit' },
        { id: 'withdrawal', label: 'Withdrawal' },
        { id: 'transfers', label: 'Transfers' },
        { id: 'party_transaction', label: 'Party Transaction' },
        { id: 'mobile_banking', label: 'Mobile Banking' },
        { id: 'reconciliation', label: 'Reconciliation' },
      ],
    },
    {
      id: 'accounting',
      label: 'Accounting',
      icon: BookOpen,
      subItems: [
        { id: 'chart_accounts', label: 'Chart of Accounts' },
        { id: 'journal_entries', label: 'Journal Entries' },
        { id: 'payments', label: 'Payments' },
        { id: 'income', label: 'Income' },
        { id: 'income_categories', label: 'Income Categories' },
        { id: 'expenses', label: 'Expenses' },
        { id: 'expense_categories', label: 'Expense Categories' },
      ],
    },
    {
      id: 'loan',
      label: 'Loan',
      icon: DollarSign,
      subItems: [
        { id: 'loan_accounts', label: 'Loan Accounts' },
        { id: 'disbursements', label: 'Disbursements' },
        { id: 'repayments', label: 'Repayments' },
        { id: 'loan_report', label: 'Loan Report' },
      ],
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      subItems: [
        { id: 'sales_report', label: 'Sales Report' },
        { id: 'purchase_register', label: 'Purchase Register' },
        { id: 'low_stock', label: 'Low Stock' },
        { id: 'dead_stock', label: 'Dead Stock' },
        { id: 'day_book', label: 'Day Book' },
        { id: 'cash_book', label: 'Cash Book' },
        { id: 'trial_balance', label: 'Trial Balance' },
        { id: 'balance_sheet', label: 'Balance Sheet' },
        { id: 'profit_loss', label: 'Profit & Loss' },
        { id: 'ar_ageing', label: 'AR Ageing' },
        { id: 'ap_ageing', label: 'AP Ageing' },
        { id: 'profit_report', label: 'Profit Report' },
        { id: 'product_profit', label: 'Product wise Profit Report' },
        { id: 'daily_report', label: 'Daily Report' },
        { id: 'new_products_daily', label: 'New Products (Daily)' },
        { id: 'new_customers_daily', label: 'New Customers (Daily)' },
        { id: 'offer_sales_report', label: 'Offer Sales Report' },
        { id: 'product_wise_total_profit', label: 'Product Wise Total Profit' },
      ],
    },
    {
      id: 'gridReport',
      label: 'Grid Report',
      icon: Grid,
      subItems: [
        { id: 'all_grid_reports', label: 'All Grid Reports' },
        { id: 'create_grid_report', label: 'Create Grid Report' },
        { id: 'grid_categories', label: 'Categories' },
      ],
    },
    {
      id: 'rdlReport',
      label: 'RDL Report',
      icon: FileText,
      subItems: [
        { id: 'report_manager', label: 'Report Manager' },
        { id: 'design_new_report', label: 'Design New Report' },
        { id: 'rdl_categories', label: 'Categories' },
        { id: 'rdl_subcategories', label: 'Subcategories' },
      ],
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      subItems: [
        { id: 'tax_rates', label: 'Tax Rates' },
        { id: 'payment_methods', label: 'Payment Method' },
        { id: 'add_suppliers_setting', label: 'Add Suppliers Setting' },
        { id: 'add_customers_setting', label: 'Add Customers Setting' },
        { id: 'add_product_setting', label: 'Add Product Setting' },
        { id: 'pos_setting', label: 'POS Setting' },
        { id: 'collection_payment_settings', label: 'Collection & Payment Settings' },
        { id: 'users', label: 'Users' },
        { id: 'roles', label: 'Roles' },
        { id: 'loan_setting', label: 'Loan Setting' },
        { id: 'system_settings', label: 'System Settings' },
        { id: 'menu_management', label: 'Menu Management' },
        { id: 'delete_history', label: 'Delete History' },
        { id: 'sales_return_setting', label: 'Sales Return Setting' },
        { id: 'sales_order_setting', label: 'Sales Order Setting' },
        { id: 'activity_log', label: 'Activity Log' },
        { id: 'purchase_setting', label: 'Purchase Setting' },
        { id: 'entry_setting', label: 'Entry Setting' },
      ],
    },
    {
      id: 'employee',
      label: 'Employee',
      icon: Users,
      subItems: [
        { id: 'employees_list', label: 'Employees' },
        { id: 'departments', label: 'Departments' },
        { id: 'designations', label: 'Designations' },
        { id: 'attendance', label: 'Attendance' },
        { id: 'employee_report', label: 'Employee Report' },
      ],
    },
    {
      id: 'salary',
      label: 'Salary',
      icon: Wallet,
      subItems: [
        { id: 'salary_structure', label: 'Salary Structure' },
        { id: 'generate_payroll', label: 'Generate Payroll' },
        { id: 'pay_slips', label: 'Pay Slips' },
        { id: 'salary_payments', label: 'Salary Payments' },
        { id: 'advances', label: 'Advances' },
        { id: 'salary_report', label: 'Salary Report' },
      ],
    },
  ];

  const toggleExpand = (menuId: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  const handleMenuClick = (item: MenuItem) => {
    if (item.subItems.length === 0) {
      onTabChange(item.id, '');
    } else {
      toggleExpand(item.id);
    }
  };

  // Filter items based on search query
  const filteredMenuItems = menuItems.filter((item) => {
    const labelMatch = item.label.toLowerCase().includes(searchQuery.toLowerCase());
    const subMatch = item.subItems.some((sub) =>
      sub.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return searchQuery === '' || labelMatch || subMatch;
  });

  return (
    <aside className="w-64 bg-[#0d1527] text-slate-300 flex flex-col h-screen select-none border-r border-slate-800/50 shrink-0">
      {/* Brand logo */}
      <div className="p-5 flex items-center gap-3 border-b border-slate-800/40">
        <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/25">
          <span className="font-display font-bold text-white text-xl tracking-wider">A</span>
        </div>
        <div className="flex flex-col">
          <span className="font-display font-bold text-white text-lg tracking-wide">AXIOM</span>
          <span className="text-[10px] text-slate-500 font-medium tracking-widest uppercase">ERP Software</span>
        </div>
      </div>

      {/* Sidebar search */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/40 text-xs text-slate-300 pl-9 pr-4 py-2 rounded-md border border-slate-800 focus:outline-none focus:border-indigo-600 transition-colors"
          />
        </div>
      </div>

      {/* Navigation menus */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 pb-6 space-y-1">
        {filteredMenuItems.map((item) => {
          const isSelected = currentTab === item.id;
          const isExpanded = expandedMenus[item.id] || searchQuery !== '';
          const hasSubItems = item.subItems.length > 0;
          const Icon = item.icon;

          return (
            <div key={item.id} className="space-y-0.5">
              <button
                id={`sidebar-menu-${item.id}`}
                onClick={() => handleMenuClick(item)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  isSelected && !hasSubItems
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-[18px] w-[18px] transition-colors ${
                      isSelected && !hasSubItems ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {hasSubItems && (
                  <div>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-slate-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-500" />
                    )}
                  </div>
                )}
              </button>

              {/* Sub items */}
              {hasSubItems && isExpanded && (
                <div className="pl-8 pr-1 py-1 space-y-0.5 border-l border-slate-800/60 ml-5">
                  {item.subItems
                    .filter(
                      (sub) =>
                        searchQuery === '' ||
                        sub.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.label.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((sub) => {
                      const isSubSelected = currentTab === item.id && currentSubTab === sub.id;
                      return (
                        <button
                          key={sub.id}
                          id={`sidebar-sub-${item.id}-${sub.id}`}
                          onClick={() => onTabChange(item.id, sub.id)}
                          className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                            isSubSelected
                              ? 'bg-slate-800 text-white font-semibold'
                              : 'text-slate-500 hover:text-slate-200'
                          }`}
                        >
                          {sub.label}
                        </button>
                      );
                    })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800/40 bg-slate-900/20 text-center flex flex-col items-center">
        <span className="text-[10px] text-slate-600 font-medium tracking-wider">Version 1.1.757</span>
        <span className="text-[9px] text-slate-700 mt-1">Database: BinBook_Axiom_Madani</span>
      </div>
    </aside>
  );
}
