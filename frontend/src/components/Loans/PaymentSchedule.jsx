import React, { useMemo } from 'react';
import { generateSchedule } from '../../services/scheduleService';

export default function PaymentSchedule({ loan }) {
  const computed = useMemo(() => {
    if (!loan) return { schedule: [], totalPayable: 0 };
    try {
      const { schedule, totalPayable } = generateSchedule({
        principal: Number(loan.amount || loan.principal || 0),
        ratePct: Number(loan.interestRate || 0),
        frequency: loan.frequency || loan.repaymentFrequency || 'monthly',
        termDays: Number(loan.duration || loan.loanDurationDays || 0),
        startDate: loan.startDate || loan.paymentStartDate || new Date().toISOString().split('T')[0],
        method: loan.interestMethod || 'reducing_equal_installments',
        feesTotal: Number(loan.loanProcessingFee || 0),
      });
      return { schedule, totalPayable };
    } catch (e) {
      console.warn('Schedule compute failed', e);
      return { schedule: [], totalPayable: 0 };
    }
  }, [loan]);

  if (!computed.schedule.length) return <div className="empty-state"><p>No schedule available.</p></div>;

  return (
    <div className="loans-table">
      <div className="table-header">
        <div className="table-row header-row">
          <div className="table-cell">#</div>
          <div className="table-cell">Due Date</div>
          <div className="table-cell">Amount</div>
          <div className="table-cell">Principal</div>
          <div className="table-cell">Interest</div>
          <div className="table-cell">Balance</div>
        </div>
      </div>
      <div className="table-body">
        {computed.schedule.map((row) => (
          <div key={row.number} className="table-row">
            <div className="table-cell">{row.number}</div>
            <div className="table-cell">{row.dueDate}</div>
            <div className="table-cell">USh {row.amount.toLocaleString()}</div>
            <div className="table-cell">USh {row.principal.toLocaleString()}</div>
            <div className="table-cell">USh {row.interest.toLocaleString()}</div>
            <div className="table-cell">USh {row.balance.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
