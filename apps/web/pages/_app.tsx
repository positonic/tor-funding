import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { resolveInitialTheme, applyTheme } from '@/lib/theme';
import { TestModeBanner } from '@/components/TestModeBanner';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  // One QueryClient per client session. useState ensures we don't recreate
  // it on every re-render, which would churn the cache and duplicate polls.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: true,
          },
        },
      }),
  );

  // Hydrate theme from sessionStorage on first client paint. The inline
  // script in _document.tsx already set the `.dark` class before hydration
  // so we don't get a flash — this just reconciles React with the DOM.
  useEffect(() => {
    applyTheme(resolveInitialTheme());
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TestModeBanner />
      <Component {...pageProps} />
    </QueryClientProvider>
  );
}
