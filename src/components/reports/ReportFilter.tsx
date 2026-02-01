import React, { useState } from 'react';
import { FileDown, Calendar } from 'lucide-react';

const ReportFilter = ({ onFilter }: { onFilter: (range: any) => void }) => {
  const [range, setRange] = useState({ start: '', end: '' });

  return (
    <div className="flex gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 items-end">
      <div>
        <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Desde</label>
        <input type="date" className="p-2 bg-gray-50 rounded-lg text-xs font-bold outline-none" 
               onChange={(e) => setRange({...range, start: e.target.value})} />
      </div>
      <div>
        <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Hasta</label>
        <input type="date" className="p-2 bg-gray-50 rounded-lg text-xs font-bold outline-none"
               onChange={(e) => setRange({...range, end: e.target.value})} />
      </div>
      <button 
        onClick={() => onFilter(range)}
        className="bg-blue-600 text-white p-2.5 rounded-xl flex items-center gap-2 font-bold text-xs"
      >
        <FileDown size={16} /> GENERAR ACTA PDF
      </button>
    </div>
  );
};

export default ReportFilter;
