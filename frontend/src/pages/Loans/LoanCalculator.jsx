import React, { useMemo, useState } from 'react';
import { Calculator as CalcIcon } from 'lucide-react';
import { generateSchedule, deriveTermAndFrequency } from '../../services/scheduleService';
import './AllLoans.css';
import AppLayout from '../../components/Layout/AppLayout';

export default function LoanCalculator() {
  const [form, setForm] = useState({ principal: 500000, ratePct: 12, method: 'reducing_equal_installments', frequency: 'monthly', durationValue: 6, durationUnit: 'months', startDate: new Date().toISOString().split('T')[0] });
  const onChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const derived = useMemo(() => {
    const { termDays } = deriveTermAndFrequency({ durationValue: Number(form.durationValue), durationUnit: form.durationUnit, frequency: form.frequency });
    return generateSchedule({ principal: Number(form.principal), ratePct: Number(form.ratePct), method: form.method, frequency: form.frequency, termDays, startDate: form.startDate });
  }, [form]);

  return (
    <AppLayout>
      <div className="dashboard-layout">
        <main className="dashboard-main">
        <div className="page-header"><div className="header-content"><h1><CalcIcon size={18}/> Loan Calculator</h1></div></div>
        <div className="loans-controls" style={{gap:12}}>
          <input type="number" name="principal" value={form.principal} onChange={onChange} placeholder="Principal" />
          <input type="number" name="ratePct" value={form.ratePct} onChange={onChange} placeholder="Rate %" step="0.01" />
          <select name="method" value={form.method} onChange={onChange}>
            <option value="flat">Flat</option>
            <option value="reducing_equal_installments">Reducing - Equal Installments</option>
            <option value="reducing_equal_principal">Reducing - Equal Principal</option>
            <option value="interest_only">Interest Only</option>
            <option value="compound">Compound</option>
          </select>
          <select name="frequency" value={form.frequency} onChange={onChange}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="bi-weekly">Bi-Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <input type="number" name="durationValue" value={form.durationValue} onChange={onChange} min="1" />
          <select name="durationUnit" value={form.durationUnit} onChange={onChange}>
            <option value="days">Days</option>
            <option value="weeks">Weeks</option>
            <option value="months">Months</option>
          </select>
          <input type="date" name="startDate" value={form.startDate} onChange={onChange} />
        </div>
        <div className="loans-table" style={{ marginTop: 12 }}>
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
            {derived.schedule.map(row => (
              <div className="table-row" key={row.number}>
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
        </main>
      </div>
    </AppLayout>
  );
}
