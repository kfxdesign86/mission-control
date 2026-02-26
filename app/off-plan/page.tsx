'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import { Building2, Calendar, DollarSign, AlertTriangle, CheckCircle2, Clock, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface Payment {
  milestone: string;
  percentage: number;
  amount: number;
  dueDate: string;
  status: 'paid' | 'upcoming' | 'overdue';
}

interface Project {
  id: string;
  name: string;
  developer: string;
  location: string;
  unitType: string;
  purchasePrice: number;
  payments: Payment[];
}

// Mock data
const projects: Project[] = [
  {
    id: '1',
    name: 'Marina Vista Tower',
    developer: 'Emaar Properties',
    location: 'Dubai Marina',
    unitType: '2BR Apartment',
    purchasePrice: 3200000,
    payments: [
      { milestone: 'Booking Fee', percentage: 10, amount: 320000, dueDate: '2025-06-15', status: 'paid' },
      { milestone: '1st Installment', percentage: 10, amount: 320000, dueDate: '2025-09-15', status: 'paid' },
      { milestone: '2nd Installment', percentage: 10, amount: 320000, dueDate: '2025-12-15', status: 'paid' },
      { milestone: '3rd Installment', percentage: 10, amount: 320000, dueDate: '2026-03-15', status: 'upcoming' },
      { milestone: 'Construction 40%', percentage: 10, amount: 320000, dueDate: '2026-06-15', status: 'upcoming' },
      { milestone: 'Construction 70%', percentage: 10, amount: 320000, dueDate: '2026-12-15', status: 'upcoming' },
      { milestone: 'Handover', percentage: 40, amount: 1280000, dueDate: '2027-06-15', status: 'upcoming' },
    ],
  },
  {
    id: '2',
    name: 'Creek Harbour Residences',
    developer: 'Sobha Realty',
    location: 'Dubai Creek Harbour',
    unitType: '3BR Penthouse',
    purchasePrice: 5800000,
    payments: [
      { milestone: 'Booking Fee', percentage: 20, amount: 1160000, dueDate: '2025-03-01', status: 'paid' },
      { milestone: '1st Installment', percentage: 10, amount: 580000, dueDate: '2025-08-01', status: 'paid' },
      { milestone: '2nd Installment', percentage: 10, amount: 580000, dueDate: '2026-02-01', status: 'overdue' },
      { milestone: 'Construction 50%', percentage: 10, amount: 580000, dueDate: '2026-08-01', status: 'upcoming' },
      { milestone: 'Handover', percentage: 50, amount: 2900000, dueDate: '2027-12-01', status: 'upcoming' },
    ],
  },
  {
    id: '3',
    name: 'Palm Jebel Ali Villas',
    developer: 'Nakheel',
    location: 'Palm Jebel Ali',
    unitType: '4BR Villa',
    purchasePrice: 8500000,
    payments: [
      { milestone: 'Booking Fee', percentage: 10, amount: 850000, dueDate: '2025-10-01', status: 'paid' },
      { milestone: '1st Installment', percentage: 10, amount: 850000, dueDate: '2026-04-01', status: 'upcoming' },
      { milestone: '2nd Installment', percentage: 10, amount: 850000, dueDate: '2026-10-01', status: 'upcoming' },
      { milestone: 'Construction 30%', percentage: 10, amount: 850000, dueDate: '2027-04-01', status: 'upcoming' },
      { milestone: 'Construction 60%', percentage: 10, amount: 850000, dueDate: '2027-10-01', status: 'upcoming' },
      { milestone: 'Handover', percentage: 50, amount: 4250000, dueDate: '2028-06-01', status: 'upcoming' },
    ],
  },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'AED', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

function getProjectStats(project: Project) {
  const totalPaid = project.payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const remaining = project.purchasePrice - totalPaid;
  const nextPayment = project.payments.find(p => p.status === 'upcoming' || p.status === 'overdue');
  const hasOverdue = project.payments.some(p => p.status === 'overdue');
  return { totalPaid, remaining, nextPayment, hasOverdue };
}

function StatusBadge({ status }: { status: Payment['status'] }) {
  const config = {
    paid: { label: 'Paid', icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    upcoming: { label: 'Upcoming', icon: Clock, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
    overdue: { label: 'Overdue', icon: AlertTriangle, color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  };
  const c = config[status];
  const Icon = c.icon;
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border', c.color)}>
      <Icon className="h-3 w-3" />
      {c.label}
    </span>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const { totalPaid, remaining, nextPayment, hasOverdue } = getProjectStats(project);
  const paidPercent = (totalPaid / project.purchasePrice) * 100;

  return (
    <motion.div
      className={cn(
        'rounded-2xl border bg-card/50 backdrop-blur-sm overflow-hidden',
        'hover:bg-card transition-all duration-300',
        'border-white/[0.04] hover:border-white/[0.08]',
        hasOverdue && 'border-red-500/20'
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
    >
      {/* Card Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">{project.name}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">{project.developer}</p>
          </div>
          <div className="p-2.5 rounded-xl border text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
            <Building2 className="h-5 w-5" />
          </div>
        </div>

        <div className="flex items-center gap-4 mb-5 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{project.location}</span>
          <span className="text-white/10">|</span>
          <span>{project.unitType}</span>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Purchase Price</p>
            <p className="text-base font-bold text-white font-numbers">{formatCurrency(project.purchasePrice)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Total Paid</p>
            <p className="text-base font-bold text-emerald-400 font-numbers">{formatCurrency(totalPaid)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Remaining</p>
            <p className="text-base font-bold text-orange-400 font-numbers">{formatCurrency(remaining)}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">Payment Progress</span>
            <span className="text-white font-medium font-numbers">{paidPercent.toFixed(2)}%</span>
          </div>
          <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
              initial={{ width: 0 }}
              animate={{ width: `${paidPercent}%` }}
              transition={{ duration: 0.8, delay: 0.5 + index * 0.1 }}
            />
          </div>
        </div>

        {/* Next Payment */}
        {nextPayment && (
          <div className={cn(
            'flex items-center justify-between p-3 rounded-xl border',
            nextPayment.status === 'overdue'
              ? 'bg-red-500/5 border-red-500/20'
              : 'bg-white/[0.02] border-white/[0.04]'
          )}>
            <div className="flex items-center gap-2">
              <Calendar className={cn('h-4 w-4', nextPayment.status === 'overdue' ? 'text-red-400' : 'text-accent')} />
              <span className="text-sm text-muted-foreground">
                {nextPayment.status === 'overdue' ? 'Overdue' : 'Next'}: <span className="text-white">{nextPayment.milestone}</span>
              </span>
            </div>
            <div className="text-right">
              <span className={cn('text-sm font-bold font-numbers', nextPayment.status === 'overdue' ? 'text-red-400' : 'text-white')}>
                {formatCurrency(nextPayment.amount)}
              </span>
              <span className="text-xs text-muted-foreground ml-2">{formatDate(nextPayment.dueDate)}</span>
            </div>
          </div>
        )}

        {/* Expand Toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 mt-4 text-sm text-accent hover:text-accent/80 font-medium transition-colors"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {expanded ? 'Hide' : 'View'} Payment Schedule
        </button>
      </div>

      {/* Payment Schedule Table */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6">
              <div className="border border-white/[0.04] rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.04] bg-white/[0.02]">
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Milestone</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Due Date</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {project.payments.map((payment, i) => (
                      <tr key={i} className={cn('border-b border-white/[0.02] last:border-0', payment.status === 'overdue' && 'bg-red-500/[0.03]')}>
                        <td className="px-4 py-3">
                          <span className="text-sm text-white">{payment.milestone}</span>
                          <span className="text-xs text-muted-foreground ml-2">({payment.percentage}%)</span>
                        </td>
                        <td className="text-right px-4 py-3 text-sm font-medium text-white font-numbers">{formatCurrency(payment.amount)}</td>
                        <td className="text-right px-4 py-3 text-sm text-muted-foreground">{formatDate(payment.dueDate)}</td>
                        <td className="text-right px-4 py-3"><StatusBadge status={payment.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function OffPlanPage() {
  // Portfolio-level stats
  const totalPortfolioValue = projects.reduce((s, p) => s + p.purchasePrice, 0);
  const totalPaid = projects.reduce((s, p) => s + p.payments.filter(x => x.status === 'paid').reduce((a, b) => a + b.amount, 0), 0);
  const totalRemaining = totalPortfolioValue - totalPaid;
  
  // Find next upcoming payment across all projects
  const allUpcoming = projects
    .flatMap(p => p.payments.filter(x => x.status === 'upcoming' || x.status === 'overdue').map(x => ({ ...x, project: p.name })))
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  const nextPayment = allUpcoming[0];
  const overdueCount = allUpcoming.filter(p => p.status === 'overdue').length;

  const summaryCards = [
    { label: 'Total Portfolio Value', value: formatCurrency(totalPortfolioValue), icon: Building2, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    { label: 'Total Committed', value: formatCurrency(totalRemaining), icon: DollarSign, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
    { label: 'Total Paid', value: formatCurrency(totalPaid), icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    {
      label: 'Next Payment Due',
      value: nextPayment ? formatCurrency(nextPayment.amount) : 'None',
      subtitle: nextPayment ? `${nextPayment.project} · ${formatDate(nextPayment.dueDate)}` : undefined,
      icon: Calendar,
      color: overdueCount > 0 ? 'text-red-400 bg-red-500/10 border-red-500/20' : 'text-accent bg-accent/10 border-accent/20',
      alert: overdueCount > 0 ? `${overdueCount} overdue` : undefined,
    },
  ];

  return (
    <div className="flex-1 page-enter">
      <Header
        title="Off Plan Portfolio"
        subtitle="Track your off-plan real estate investments and payment obligations"
      />

      <div className="p-8 space-y-10">
        {/* Summary Stats */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {summaryCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.label}
                  className={cn(
                    'relative p-5 rounded-2xl border bg-card/50 backdrop-blur-sm',
                    'border-white/[0.04] hover:border-white/[0.08] transition-all duration-300'
                  )}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={cn('p-2 rounded-xl border', card.color)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    {card.alert && (
                      <span className="text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {card.alert}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{card.label}</p>
                  <p className="text-2xl font-bold text-white font-numbers tracking-tight">{card.value}</p>
                  {card.subtitle && <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>}
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Project Cards */}
        <section>
          <motion.div
            className="flex items-center justify-between mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Projects</h2>
              <p className="text-sm text-muted-foreground mt-1">{projects.length} active off-plan investments</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
