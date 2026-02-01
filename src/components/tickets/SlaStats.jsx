import React from 'react';
import { Clock, CheckCircle, AlertTriangle, Activity } from 'lucide-react';

const SlaStats = ({ stats }) => {
  const cards = [
    { label: 'Tickets Abiertos', value: stats.open || 0, icon: <Activity className="text-blue-600" />, bg: 'bg-blue-50' },
    { label: 'SLA Incumplido (>4h)', value: stats.expired || 0, icon: <AlertTriangle className="text-red-600" />, bg: 'bg-red-50' },
    { label: 'Atención Promedio', value: `${stats.avgTime || 0} min`, icon: <Clock className="text-purple-600" />, bg: 'bg-purple-50' },
    { label: 'Cerrados Hoy', value: stats.closedToday || 0, icon: <CheckCircle className="text-green-600" />, bg: 'bg-green-50' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, i) => (
        <div key={i} className={`p-6 rounded-xl border border-gray-100 shadow-sm ${card.bg} transition-transform hover:scale-[1.02]`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{card.label}</p>
              <h3 className="text-2xl font-bold text-gray-900 italic tracking-tight">{card.value}</h3>
            </div>
            <div className="p-2 bg-white rounded-lg shadow-sm">
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SlaStats;
