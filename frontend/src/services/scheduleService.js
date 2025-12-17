// Loan schedule generation utilities supporting Flat, Reducing (Equal Installments), Reducing (Equal Principal), Interest-Only, and Compound.

const DAYS_IN_WEEK = 7;
const DAYS_IN_MONTH = 30; // simplified month for schedule purposes

const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

function toDays(value, unit) {
  switch ((unit || 'days').toLowerCase()) {
    case 'day':
    case 'days':
      return value;
    case 'week':
    case 'weeks':
      return value * DAYS_IN_WEEK;
    case 'month':
    case 'months':
      return value * DAYS_IN_MONTH;
    default:
      return value;
  }
}

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  const nd = new Date(d.getTime());
  nd.setDate(nd.getDate() + days);
  return nd.toISOString().split('T')[0];
}

function perPeriodRate({ annualRatePct, ratePer, frequency }) {
  // Convert nominal rate input to per-period decimal rate
  // If ratePer is per month/week/day, first compute nominal per day then scale to period
  const perDayRate = (() => {
    switch ((ratePer || 'month').toLowerCase()) {
      case 'day':
      case 'daily':
        return annualRatePct / 100; // already per day (interpreted directly)
      case 'week':
      case 'weekly':
        return (annualRatePct / 100) / DAYS_IN_WEEK;
      case 'month':
      case 'monthly':
      default:
        return (annualRatePct / 100) / DAYS_IN_MONTH;
    }
  })();

  const periodDays = frequencyToDays(frequency);
  return perDayRate * periodDays;
}

function frequencyToDays(frequency) {
  switch ((frequency || 'monthly').toLowerCase()) {
    case 'daily':
      return 1;
    case 'weekly':
      return DAYS_IN_WEEK;
    case 'bi-weekly':
    case 'biweekly':
      return 14;
    case 'monthly':
    default:
      return DAYS_IN_MONTH;
  }
}

function numberOfPayments(termDays, frequency) {
  const per = frequencyToDays(frequency);
  return Math.max(1, Math.ceil(termDays / per));
}

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function generateFlatSchedule({
  principal,
  ratePct,
  frequency,
  termDays,
  startDate,
  feesTotal = 0,
  firstRepaymentDate,
  firstRepaymentAmount,
}) {
  const n = numberOfPayments(termDays, frequency);
  const iPer = perPeriodRate({ annualRatePct: ratePct, ratePer: 'month', frequency });
  const totalInterest = principal * iPer * n; // flat interest distributes evenly
  const base = principal + totalInterest + feesTotal;
  const installment = round2(base / n);

  let balance = principal;
  const schedule = [];
  for (let k = 1; k <= n; k++) {
    const dueDate = k === 1 && firstRepaymentDate
      ? firstRepaymentDate
      : addDays(startDate, frequencyToDays(frequency) * (k));

    let amount = installment;
    if (k === 1 && firstRepaymentAmount) amount = firstRepaymentAmount;
    if (k === n) {
      // adjust rounding
      const sumPrev = schedule.reduce((s, p) => s + p.amount, 0) + amount;
      amount = round2(base - (sumPrev - amount));
    }

    const interest = round2(totalInterest / n);
    const principalPart = round2(amount - interest);
    balance = round2(balance - principalPart);

    schedule.push({
      number: k,
      dueDate,
      amount: round2(amount),
      principal: clamp(principalPart, 0, principal),
      interest,
      fees: 0,
      penalty: 0,
      paidAmount: 0,
      status: 'pending',
      balance: balance < 0.01 ? 0 : balance,
    });
  }

  const totals = schedule.reduce((acc, s) => ({
    amount: round2(acc.amount + s.amount),
    principal: round2(acc.principal + s.principal),
    interest: round2(acc.interest + s.interest),
  }), { amount: 0, principal: 0, interest: 0 });

  return { schedule, totals, totalPayable: round2(totals.amount) };
}

function generateReducingAnnuity({ principal, ratePct, frequency, termDays, startDate, feesTotal = 0, firstRepaymentDate, firstRepaymentAmount }) {
  const n = numberOfPayments(termDays, frequency);
  const i = perPeriodRate({ annualRatePct: ratePct, ratePer: 'month', frequency });
  const A = i === 0 ? principal / n : principal * i * Math.pow(1 + i, n) / (Math.pow(1 + i, n) - 1);
  const installment = round2(A + (feesTotal / n));

  let bal = principal;
  const schedule = [];
  for (let k = 1; k <= n; k++) {
    const dueDate = k === 1 && firstRepaymentDate ? firstRepaymentDate : addDays(startDate, frequencyToDays(frequency) * (k));
    const interest = round2(bal * i);
    let amount = round2(installment);
    if (k === 1 && firstRepaymentAmount) amount = firstRepaymentAmount;
    const principalPart = round2(amount - interest);
    bal = round2(bal - principalPart);
    if (k === n) {
      // Fix rounding on final
      amount = round2(principal + schedule.reduce((s, r) => s + r.interest, 0) + feesTotal - schedule.reduce((s, r) => s + r.amount, 0));
      const pAdj = round2(amount - interest);
      bal = round2(bal - (pAdj - principalPart));
    }
    schedule.push({ number: k, dueDate, amount, principal: principalPart, interest, fees: 0, penalty: 0, paidAmount: 0, status: 'pending', balance: bal < 0.01 ? 0 : bal });
  }
  const totals = schedule.reduce((a, s) => ({ amount: round2(a.amount + s.amount), principal: round2(a.principal + s.principal), interest: round2(a.interest + s.interest) }), { amount: 0, principal: 0, interest: 0 });
  return { schedule, totals, totalPayable: round2(totals.amount) };
}

function generateReducingEqualPrincipal({ principal, ratePct, frequency, termDays, startDate, feesTotal = 0, firstRepaymentDate, firstRepaymentAmount }) {
  const n = numberOfPayments(termDays, frequency);
  const i = perPeriodRate({ annualRatePct: ratePct, ratePer: 'month', frequency });
  const principalPer = round2(principal / n);
  let bal = principal;
  const schedule = [];
  for (let k = 1; k <= n; k++) {
    const dueDate = k === 1 && firstRepaymentDate ? firstRepaymentDate : addDays(startDate, frequencyToDays(frequency) * (k));
    const interest = round2(bal * i);
    let amount = round2(principalPer + interest + (feesTotal / n));
    if (k === 1 && firstRepaymentAmount) amount = firstRepaymentAmount;
    bal = round2(bal - principalPer);
    if (k === n) {
      const sumPrev = schedule.reduce((s, p) => s + p.amount, 0) + amount;
      amount = round2(principal + schedule.reduce((s, r) => s + r.interest, 0) + feesTotal - (sumPrev - amount));
      bal = 0;
    }
    schedule.push({ number: k, dueDate, amount, principal: principalPer, interest, fees: 0, penalty: 0, paidAmount: 0, status: 'pending', balance: bal < 0.01 ? 0 : bal });
  }
  const totals = schedule.reduce((a, s) => ({ amount: round2(a.amount + s.amount), principal: round2(a.principal + s.principal), interest: round2(a.interest + s.interest) }), { amount: 0, principal: 0, interest: 0 });
  return { schedule, totals, totalPayable: round2(totals.amount) };
}

function generateInterestOnly({ principal, ratePct, frequency, termDays, startDate, feesTotal = 0, firstRepaymentDate, firstRepaymentAmount }) {
  const n = numberOfPayments(termDays, frequency);
  const i = perPeriodRate({ annualRatePct: ratePct, ratePer: 'month', frequency });
  const interestPer = round2(principal * i);
  let bal = principal;
  const schedule = [];
  for (let k = 1; k <= n; k++) {
    const dueDate = k === 1 && firstRepaymentDate ? firstRepaymentDate : addDays(startDate, frequencyToDays(frequency) * (k));
    let amount = interestPer;
    let principalPart = 0;
    if (k === n) {
      principalPart = principal; // principal balloon
      amount = round2(interestPer + principalPart + (feesTotal));
    }
    if (k === 1 && firstRepaymentAmount) amount = firstRepaymentAmount;
    bal = k === n ? 0 : bal;
    schedule.push({ number: k, dueDate, amount, principal: principalPart, interest: k === n ? interestPer : interestPer, fees: 0, penalty: 0, paidAmount: 0, status: 'pending', balance: bal });
  }
  const totals = schedule.reduce((a, s) => ({ amount: round2(a.amount + s.amount), principal: round2(a.principal + s.principal), interest: round2(a.interest + s.interest) }), { amount: 0, principal: 0, interest: 0 });
  return { schedule, totals, totalPayable: round2(totals.amount) };
}

function generateCompound({ principal, ratePct, frequency, termDays, startDate, feesTotal = 0 }) {
  // Simple compounding where payoff at maturity
  const n = numberOfPayments(termDays, frequency);
  const i = perPeriodRate({ annualRatePct: ratePct, ratePer: 'month', frequency });
  const compounded = principal * Math.pow(1 + i, n);
  const payoff = round2(compounded + feesTotal);
  const dueDate = addDays(startDate, frequencyToDays(frequency) * n);
  return { schedule: [{ number: 1, dueDate, amount: payoff, principal: 0, interest: round2(payoff - principal - feesTotal), fees: feesTotal, penalty: 0, paidAmount: 0, status: 'pending', balance: 0 }], totals: { amount: payoff, principal: 0, interest: round2(payoff - principal - feesTotal) }, totalPayable: payoff };
}

export function generateSchedule(options) {
  const { method } = options;
  switch ((method || 'reducing_equal_installments').toLowerCase()) {
    case 'flat':
    case 'flat_rate':
      return generateFlatSchedule(options);
    case 'reducing_equal_principal':
      return generateReducingEqualPrincipal(options);
    case 'interest_only':
      return generateInterestOnly(options);
    case 'compound':
      return generateCompound(options);
    case 'reducing_equal_installments':
    default:
      return generateReducingAnnuity(options);
  }
}

export function deriveTermAndFrequency({ durationValue, durationUnit, frequency }) {
  const termDays = toDays(durationValue, durationUnit || 'days');
  const n = numberOfPayments(termDays, frequency);
  const perDays = frequencyToDays(frequency);
  return { termDays, numberOfPayments: n, daysPerPeriod: perDays };
}

export function sumSchedule(schedule) {
  const totals = schedule.reduce((a, s) => ({ amount: round2(a.amount + s.amount), principal: round2(a.principal + s.principal), interest: round2(a.interest + s.interest), fees: round2((a.fees||0) + (s.fees||0)) }), { amount: 0, principal: 0, interest: 0, fees: 0 });
  return { ...totals, totalPayable: round2(totals.amount) };
}

// eslint-disable-next-line import/no-anonymous-default-export
export default { generateSchedule, deriveTermAndFrequency, sumSchedule };
