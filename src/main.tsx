import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import ErrorBoundary from './components/ErrorBoundary.tsx'
import Toaster from './components/Toaster.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 seconds - fresher data
      gcTime: 300000, // 5 minutes - keep in cache
      retry: 1, // Only 1 retry on failure
      refetchOnWindowFocus: true, // Refetch when tab regains focus for real-time updates
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster />
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
