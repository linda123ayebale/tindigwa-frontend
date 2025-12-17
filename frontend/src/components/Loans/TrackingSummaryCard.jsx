import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import './TrackingSummaryCard.css';

/**
 * TrackingSummaryCard - Displays payment tracking and progress
 */
const TrackingSummaryCard = ({ tracking, loan }) => {
  if (!tracking) {
    return (
      <div className="bg-white shadow-lg rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Tracking</h3>
        <p className="text-gray-500">No tracking data available</p>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'USh 0';
    return `USh ${Number(amount).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const paymentProgress = tracking.totalInstallments > 0
    ? ((tracking.installmentsPaid / tracking.totalInstallments) * 100).toFixed(1)
    : 0;

  const amountProgress = loan?.totalPayable > 0
    ? ((tracking.amountPaid / loan.totalPayable) * 100).toFixed(1)
    : 0;

  return (
    <div className="bg-white shadow-lg rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Payment Tracking</h3>
        <TrendingUp size={20} className="text-blue-600" />
      </div>

      {/* Progress Bars */}
      <div className="space-y-6 mb-6">
        {/* Installments Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Payment Progress</span>
            <span className="text-sm font-semibold text-blue-600">{paymentProgress}%</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${paymentProgress}%` }}
            ></div>
          </div>
          <div className="mt-1 text-xs text-gray-500">
            {tracking.installmentsPaid} of {tracking.totalInstallments} payments made
          </div>
        </div>

        {/* Amount Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Amount Paid</span>
            <span className="text-sm font-semibold text-green-600">{amountProgress}%</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${amountProgress}%` }}
            ></div>
          </div>
          <div className="mt-1 text-xs text-gray-500">
            {formatCurrency(tracking.amountPaid)} of {formatCurrency(loan?.totalPayable)}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Outstanding Balance */}
        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <DollarSign size={20} className="text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-red-600 font-medium uppercase">Outstanding Balance</p>
              <p className="text-lg font-bold text-red-900">{formatCurrency(tracking.balance)}</p>
            </div>
          </div>
        </div>

        {/* Next Payment Due */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <Calendar size={20} className="text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-blue-600 font-medium uppercase">Next Payment Due</p>
              <p className="text-lg font-bold text-blue-900">{formatDate(tracking.nextPaymentDate)}</p>
            </div>
          </div>
        </div>

        {/* Next Payment Amount */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <DollarSign size={20} className="text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-green-600 font-medium uppercase">Next Payment Amount</p>
              <p className="text-lg font-bold text-green-900">
                {formatCurrency(tracking.nextPaymentAmount)}
              </p>
            </div>
          </div>
        </div>

        {/* Penalties (if any) */}
        {tracking.penalty && tracking.penalty > 0 && (
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <AlertCircle size={20} className="text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-orange-600 font-medium uppercase">Penalties</p>
                <p className="text-lg font-bold text-orange-900">{formatCurrency(tracking.penalty)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Status Badge */}
        {tracking.status && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <TrendingUp size={20} className="text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600 font-medium uppercase">Status</p>
                <p className="text-lg font-bold text-gray-900">{tracking.status}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackingSummaryCard;
