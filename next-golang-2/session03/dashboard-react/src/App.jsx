
import { useState } from "react"

import './App.css'
import Box from "./components/box"
import Card from './components/card'

// component , functional component , untuk bisa melakukan reactivity itu memakai hooks 
// RE-RENDER 
function App() {
  // setCounter adalah method untuk merubah nilai state nya 
  const [counter, setCounter] = useState(0) // hooks

  const [title, setTitle] = useState("")
  const [price, setPrice] = useState("")

  const [isProductView, setIsProductView] = useState(true)

  const age = 35

  const [products, setProducts] = useState([
    {title:"RTX 3060 msi 12GB", price:8_000_000},
    {title:"AOC monitor 27 inch", price:3_000_000},
    {title:"NZXT mattle black tower case", price:1_500_000}
  ])

  // arrow function 
  const handleCreateProduct = (e) => {

    e.preventDefault()

    const newProduct = {
      title, 
      price
    }
    setProducts([
      ...products,
      newProduct
    ])
  }
 
  return (
    <>
    <h1> Hello Kelas Santai </h1>
    <p> Umur saya : {age}</p>
    <Box />
    <Box />

    <button onClick={() => setCounter(counter + 1)}>
      Click Me : {counter}
    </button>

    <form>
      <label> Title </label>
      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
      <label> Price </label>
      <input type="number" value={price} onChange={(e) => setPrice(e.target.value)}/>
      <button onClick={(e) => handleCreateProduct(e)}> Submit </button>
    </form>

    <input type="checkbox" checked={isProductView} value={"Product View"} onChange={(e) =>
      setIsProductView(e.target.checked)
    }/>
    Product View 

    {/* passing property ke component */}
    <div style={{ display: isProductView ? "flex" : "none", flexDirection:"row", margin:"20px 0 20px 0"}}>
      {products.map((item) => <Card title={item.title} price={item.price} />)}
    </div>
   
    </>
  )
}

export default App
