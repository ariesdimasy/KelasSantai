import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import StateCard from './components/StatCard.jsx'
import DataTable from './components/DataTable.jsx'

const data = [
  {
    name:"Arjuna",
    salary:5000000,
    grade:"B",
    city:"jakarta",

  },
  {
    name:"Dimas",
     salary:5700000,
    grade:"A",
    city:"Tangerang",
    
  },
  {
    name:"Dina",
     salary:6000000,
    grade:"A",
    city:"Bogor",
    
  }
]

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div class="flex min-h-screen bg-gray-100 dark:bg-gray-900">

      <aside class="fixed inset-y-0 left-0 z-50 w-64
                    bg-gray-900 dark:bg-gray-950 flex flex-col">
        <div class="h-16 flex items-center px-6 border-b border-gray-800">
          <span class="text-white font-bold">⚡ AdminKit</span>
        </div>
        <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <a class="flex items-center gap-3 px-3 py-2.5 rounded-lg
                    bg-blue-600 text-white font-medium text-sm">📊 Dashboard</a>
          <a class="flex items-center gap-3 px-3 py-2.5 rounded-lg
                    text-gray-400 hover:text-white hover:bg-gray-800
                    font-medium text-sm transition">👥 Users</a>
        </nav>
      </aside>


      <div class="flex-1 pl-64 flex flex-col">

      
        <header class="h-16 bg-white dark:bg-gray-800
                      border-b border-gray-200 dark:border-gray-700
                      flex items-center justify-between px-6
                      sticky top-0 z-40">
          <h1 class="font-semibold text-gray-900 dark:text-white">Dashboard</h1>
          <button id="toggleDark" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">🌙</button>
        </header>

        <main class="flex-1 overflow-auto p-6">
          <div className='flex flex-col-3 gap-6 my-10'>
            <StateCard />
            <StateCard />
            <StateCard />
          </div>
          <DataTable data={data} />
        </main>
      </div>
    </div>

  </StrictMode>,
)
