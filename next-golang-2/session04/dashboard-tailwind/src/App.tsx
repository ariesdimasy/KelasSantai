import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Home from './pages/home'
import Service from './pages/service'

import './App.css'


function App() {

  return (
    <>
     
      {/* 
      <!-- Flex: stack → row --> */}
      <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
        <aside className="fixed inset-y-0 left-0 z-50 w-64
                bg-gray-900 dark:bg-gray-950 flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-gray-800">
            <span className="text-white font-bold">⚡ AdminKit</span>
          </div>
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            <a href='/' className="flex items-center gap-3 px-3 py-2.5 rounded-lg
                      bg-blue-600 text-white font-medium text-sm">📊 Dashboard</a>
            <a href='/service' className="flex items-center gap-3 px-3 py-2.5 rounded-lg
                      text-gray-400 hover:text-white hover:bg-gray-800
                      font-medium text-sm transition">👥 Service</a>
          </nav>
        </aside>
        <div className="flex-1 pl-64 flex flex-col">
            <header className="h-16 bg-white dark:bg-gray-800
                          border-b border-gray-200 dark:border-gray-700
                          flex items-center justify-between px-6
                          sticky top-0 z-40">
              <h1 className="font-semibold text-gray-900 dark:text-white">Dashboard</h1>
              <button id="toggleDark" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">🌙</button>
            </header>
           <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/service" element={<Service />} />
                </Routes>
           </BrowserRouter>
        </div>
      </div>
    </>
  )
}

export default App
