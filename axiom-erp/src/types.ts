export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  warehouse: string;
  price: number;
  cost: number;
  stock: number;
  alertQty: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  group: string;
  outstandingBalance: number;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email: string;
  companyName: string;
  group: string;
  outstandingBalance: number;
}

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  customerId: string;
  customerName: string;
  date: string;
  items: SaleItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  paymentMethod: 'Cash' | 'Credit' | 'Mobile Banking';
  isPaid: boolean;
}

export interface POItem {
  productId: string;
  name: string;
  quantity: number;
  cost: number;
  subtotal: number;
}

export interface PurchaseOrder {
  id: string;
  poNo: string;
  supplierId: string;
  supplierName: string;
  date: string;
  items: POItem[];
  subtotal: number;
  total: number;
  status: 'Ordered' | 'Received' | 'Cancelled';
}

export interface BankAccount {
  id: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  balance: number;
  type: 'Savings' | 'Current' | 'Mobile';
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  type: 'Deposit' | 'Withdrawal' | 'Transfer' | 'Income' | 'Expense';
  amount: number;
  accountId: string; // references BankAccount
  category: string;
  referenceNo?: string;
}

export interface AccountHead {
  id: string;
  name: string;
  code: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  balance: number;
}

export interface Employee {
  id: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  joiningDate: string;
  salary: number;
  status: 'Active' | 'Inactive';
}

export interface Attendance {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Leave';
  checkIn?: string;
  checkOut?: string;
}

export interface LoanAccount {
  id: string;
  accountNo: string;
  borrowerName: string;
  amount: number;
  interestRate: number;
  durationMonths: number;
  disbursedAmount: number;
  outstandingAmount: number;
  status: 'Active' | 'Paid';
}

export interface LoanRepayment {
  id: string;
  loanId: string;
  date: string;
  amount: number;
  principal: number;
  interest: number;
  referenceNo: string;
}
