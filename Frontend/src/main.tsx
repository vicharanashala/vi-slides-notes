import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { Toaster } from "@/components/ui/toaster";

createRoot(document.getElementById('root')!).render(
    <AuthProvider>
      <App />
      <Toaster />
    </AuthProvider>
  
)
