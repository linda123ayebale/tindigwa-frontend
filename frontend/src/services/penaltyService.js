// Penalty calculation helpers for late and after-maturity scenarios.

function daysBetween(dateA, dateB) {
  const a = new Date(dateA);
  const b = new Date(dateB);
  return Math.floor((b - a) / (1000 * 60 * 60 * 24));
}

function round2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }

export function calculateLatePenalty({
  dueDate,
  paidDate = new Date().toISOString().split('T')[0],
  outstandingAmount,
  graceDays = 0,
  rule = { type: 'percent_per_day', value: 0.2, capPercentOfOutstanding: 100 }
}) {
  const today = paidDate;
  const daysLate = Math.max(0, daysBetween(dueDate, today));
  if (daysLate <= graceDays) return { daysLate, penalty: 0 };

  const chargeableDays = daysLate - graceDays;
  let penalty = 0;
  if (rule.type === 'fixed_per_day') {
    penalty = rule.value * chargeableDays;
  } else {
    // percent per day
    penalty = (outstandingAmount * (rule.value / 100)) * chargeableDays;
    if (rule.capPercentOfOutstanding) {
      const cap = outstandingAmount * (rule.capPercentOfOutstanding / 100);
      penalty = Math.min(penalty, cap);
    }
  }
  return { daysLate, penalty: round2(penalty) };
}

export function calculateAfterMaturityPenalty({
  endDate,
  paidDate = new Date().toISOString().split('T')[0],
  outstandingAmount,
  rule = { type: 'percent_per_day', value: 0.3 }
}) {
  const daysLate = Math.max(0, daysBetween(endDate, paidDate));
  if (daysLate === 0) return { daysLate, penalty: 0 };

  let penalty = 0;
  if (rule.type === 'fixed_per_day') {
    penalty = rule.value * daysLate;
  } else {
    penalty = (outstandingAmount * (rule.value / 100)) * daysLate;
  }
  return { daysLate, penalty: round2(penalty) };
}

// eslint-disable-next-line import/no-anonymous-default-export
export default { calculateLatePenalty, calculateAfterMaturityPenalty };