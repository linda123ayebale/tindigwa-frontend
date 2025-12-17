import React from 'react';
import { Calendar, DollarSign, CreditCard, FileText, CheckCircle, User } from 'lucide-react';
import './PaymentHistoryTable.css';

/**
 * PaymentHistoryTable Component
 * Displays a table of all payments made for a loan
 * 
 * @param {Array} payments - Array of payment objects from API
 */
const PaymentHistoryTable = ({ payments = [] }) => {
  /**
   * Format currency amount
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  /**
   * Format date to readable string
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  /**
   * Get payment method display name
   */
  const getMethodDisplay = (method) => {
    const methodMap = {
      'cash': 'Cash',
      'bank_transfer': 'Bank Transfer',
      'mobile_money': 'Mobile Money',
      'check': 'Cheque',
      'card': 'Card Payment'
    };
    return methodMap[method?.toLowerCase()] || method || 'N/A';
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
            <p className="text-sm text-gray-500">
              {payments.length} {payments.length === 1 ? 'payment' : 'payments'} recorded
            </p>
          </div>
        </div>
      </div>

      {/* Table or Empty State */}
      {payments.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm">No payments recorded yet</p>
          <p className="text-gray-400 text-xs mt-1">Payment history will appear here once payments are made</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Amount
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Method
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Reference
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Status
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Recorded By
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((payment, index) => (
                <tr key={payment.id || index} className="hover:bg-gray-50 transition-colors">
                  {/* Payment Date */}
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-900 font-medium">
                      {formatDate(payment.paymentDate)}
                    </span>
                  </td>

                  {/* Amount */}
                  <td className="py-4 px-4">
                    <span className="text-sm font-semibold text-green-600">
                      {formatCurrency(payment.amount)}
                    </span>
                  </td>

                  {/* Payment Method */}
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-700">
                      {getMethodDisplay(payment.method)}
                    </span>
                  </td>

                  {/* Reference Number */}
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-600 font-mono">
                      {payment.referenceNumber || 'N/A'}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-700">
                      {payment.status || 'Completed'}
                    </span>
                  </td>

                  {/* Recorded By */}
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-700">
                      {payment.recordedBy || 'System'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary Footer (only if payments exist) */}
      {payments.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total Payments</span>
            <span className="text-lg font-bold text-green-600">
              {formatCurrency(
                payments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHistoryTable;
