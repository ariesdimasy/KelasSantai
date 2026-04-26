import { useState } from 'react'
import './App.css'
import Box from './components/Box'
import Button from './components/Button'
import Badge from './components/Badge'
import StateCard from './components/StatCard'
import Table from './components/DataTable'
import Input from './components/Input'
function App() {

  const [theme, setTheme] = useState("light")

  const toggleTheme = () => {
    if(theme == "light") {
      setTheme("dark")
    } else {
      setTheme("light")
    }
  }

  return (
    <div className={`${theme} p-5 `}>
      <button onClick={ () => toggleTheme()}> change theme</button>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 
      bg-blue-500 mb-[10px]'>
        <Box />
        <Box />
        <Box />
        <Box />
      </div>

      <div className='flex flex-col md:flex-row gap-6 h-[200px] bg-pink-500'>
        <aside className='w-full md:w-64 bg-yellow-500 '>
          Sidebar
        </aside>
        <main className='flex-1 bg-blue-500'>
          <div className='md:block hidden bg-green-200'> Hanya di tablet </div>
          <div className='md:hidden block'> Hanya di mobile </div>
        </main>
      </div>

      <div className='my-10'>
        <Button type="primary" text="Click Me" onClick={() => alert(" Thanks ")} />
        <Button text="Click Me again!" onClick={() => alert("thanks again")} />
        <Badge type="active" text="this is information text" />
        <Badge type="pending" text="this is information text" />
      </div>
      

      <div className='flex flex-col-3 gap-6 my-10'>
        <StateCard />
        <StateCard />
        <StateCard />
      </div>

      <Table />

      <Input />
      
    </div>
  )
}

export default App
