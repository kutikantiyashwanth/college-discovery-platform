import { useState, type ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
}

export function Tabs({ tabs, defaultTab }: TabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id ?? '');
  const current = tabs.find(t => t.id === active);

  return (
    <div>
      <div className="border-b border-slate-200 flex gap-0 overflow-x-auto" role="tablist">
        {tabs.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active === tab.id}
            onClick={() => setActive(tab.id)}
            className={`
              px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
              ${active === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pt-6" role="tabpanel">
        {current?.content}
      </div>
    </div>
  );
}
