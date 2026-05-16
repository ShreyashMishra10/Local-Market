import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { store } from './store/store.js'
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <HelmetProvider>
          <ThemeProvider>
            <AuthProvider>
              <App />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 2500,
                  style: { borderRadius: '12px', background: '#1f2937', color: '#fff', fontSize: '14px' },
                  success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
                  error:   { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
                }}
              />
            </AuthProvider>
          </ThemeProvider>
        </HelmetProvider>
      </Provider>
    </BrowserRouter>
  </React.StrictMode>,
)
