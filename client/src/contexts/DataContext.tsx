import React, { createContext, useContext, useEffect, useState } from 'react';
import type { DemoData, ExtraData } from '@/lib/demoData';

interface DataContextValue {
  data: DemoData | null;
  extra: ExtraData | null;
  loading: boolean;
  error: string | null;
}

const DataContext = createContext<DataContextValue>({
  data: null,
  extra: null,
  loading: true,
  error: null,
});

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<DemoData | null>(null);
  const [extra, setExtra] = useState<ExtraData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const baseUrl = import.meta.env.BASE_URL;

    Promise.all([
      fetch(`${baseUrl}demo_data.json`).then((r) => {
        if (!r.ok) throw new Error(`demo_data.json HTTP ${r.status}`);
        return r.json() as Promise<DemoData>;
      }),
      fetch(`${baseUrl}demo_data_extra.json`).then((r) => {
        if (!r.ok) throw new Error(`demo_data_extra.json HTTP ${r.status}`);
        return r.json() as Promise<ExtraData>;
      }),
    ])
      .then(([d, e]) => {
        setData(d);
        setExtra(e);
        setLoading(false);
      })
      .catch((err) => {
        setError(String(err));
        setLoading(false);
      });
  }, []);

  return (
    <DataContext.Provider value={{ data, extra, loading, error }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
