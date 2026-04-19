
import './App.css'
import Card, { Card2 } from './components/Card' // path file component Card
import { useState, useEffect } from 'react' // import React untuk menggunakan class component

// functional component
function App() {

  const [theme, setTheme] = useState("light") // useState adalah hook yang digunakan untuk membuat state di functional component
  // theme is state name , state variable
  // setTheme is function to update state value
  // theme = "light" // default value of theme state is "light" 
  // untuk merubah nilai theme tidak boleh langsung assign ke theme , theme = "dark"
  // setTheme("dark")

  const[name , setName] = useState() // state untuk menyimpan nama user
  const [age, setAge] = useState() // state untuk menyimpan umur user
  const [data, setData] = useState([
    { name  : "Aries Dimas", age: 30 },
    { name  : "John Doe", age: 25 },
    { name  : "Jane Doe", age: 28 },
  ]) // state untuk menyimpan data user

  const [task, setTask] = useState("")
  const [todos, setTodos] = useState([])
 

  const products = [
    { name: "Logitech keyboard K120", desc: "Ergonomic keyboard with backlight" },
    { name: "Mouse Logitech MX Master 3", desc: "Wireless mouse with precision sensor" },
    { name: "NVDIA RTX 3080", desc: "High-performance graphics card" },
  ]

  const handlePersonSubmit = ( event ) => {
    event.preventDefault() // mencegah form submit secara default yang akan merefresh halaman
    const newPerson = {
      name: name,
      age: age
    }
    data.push(newPerson) // menambahkan data baru ke array data

    setName("") // reset input name setelah submit
    setAge("") // reset input age setelah submit
   
  }

  const handleTaskSubmit = (event) => {
     event.preventDefault() // mencegah form submit secara default yang akan merefresh halaman

     const newTask = {
      title:task,
      done:false,
      createdAt: new Date(),
      id: Date.now()
     }

     const todos =  JSON.parse(localStorage.getItem("todos")) || []

     todos.push(newTask)

     localStorage.setItem("todos", JSON.stringify(todos))
     setTask("")
     getDataFromLocalStorage()
  }

  const getDataFromLocalStorage = () => {
     const todos = JSON.parse(localStorage.getItem("todos")) || []
     setTodos(todos)
  }

  useEffect(() => {
    getDataFromLocalStorage()
  },[])


  return (
    <div className={theme === "light" ? "app-light" : "app-dark"}>
      <h1>My App</h1>
      {JSON.stringify(todos)}
      <p> Hello, {name}! This is my first React app.</p>

      { 1991 > 1990 ? <p>Anda lahir setelah tahun 1990</p> : <p>Anda lahir sebelum tahun 1990</p>}
      <table border="1" cellPadding="10" cellSpacing="0" style={{ borderCollapse: "collapse", margin:"20px auto"}}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Age</th>
          </tr>
        </thead>
        <tbody>
          {data.map(function (item, index) { 
            return (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{item.age}</td>
              </tr>
            ); 
          })}
        </tbody>
      </table>
      <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexDirection: "row", marginBottom: "20px" }}>
        {products.map((product, index) => {
          return <Card index={index} name={product.name} desc={product.desc} />
        })}
      </div>
    
      <Card2 onClick={() => alert("Card2 clicked")} />
      <div className='card'>
          <div> This is component from App.jsx </div>
      </div>
      <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
        Change Theme to {theme === "light" ? "Dark" : "Light"}
      </button>

      <div>
        <div> Insert Person</div>
        <form onSubmit={handlePersonSubmit}>
          <div>
            <label> Name </label>
            <input type="text" placeholder='Name' 
            onChange={(e) => setName(e.target.value)} 
            value={name} />
          </div>
          <div>
            <label> Age </label>
            <input type="number" placeholder='Age' 
            // event handling 
            onChange={e => setAge(e.target.value)} 
            value={age} />
          </div>
          <div>
            <button> Submit </button>
          </div>
        </form>
        <input type="text" placeholder='please press enter' onKeyDown={(e) => {
          if(e.key === "Enter"){
            alert("You pressed Enter key")
          }
        }}  />
      </div>
      <div className='todoList'>
        <h2>Todo List</h2>
        {todos.length === 0 ? <p>No todos</p> : (
          <div>
            {todos.map((item, index) => {
              return(<Card2 title={item.title} done={item.completed} createdAt={item.createdAt}/> )
            })}
          </div>
        )}
        <form onSubmit={handleTaskSubmit}>
          <div>
            <label> Title </label>
            <input type="text" placeholder='Task' 
            onChange={(e) => setTask(e.target.value)} 
            value={task} />
          </div>
       
          <div>
            <button> Submit </button>
          </div>
        </form>
      </div>
    </div>
   
   
  )
}

// // class component 
// // class AppClass extends React.Component {
// //   render() {
// //     return (
// //       <>
// //       </>
// //     )
// //   }
// // }

// test() // tidak error karena function declaration dihoisting
// // declaration function di javascript akan dihoisting, artinya kita bisa memanggil function sebelum dideklarasikan
// function test(){
//   return 12 
// }

// test2() // error karena function expression tidak dihoisting
// // function expression
// // mengassign sebuah function ke dalam sebuah variable
// const test2 = function () {
//   // keyword this 
//   this.name = "Aries Dimas"
//   return 12 
// }
// test2() // 


// // arrow function 
// const test3 = () => {
//   // tidak ada keyword this 
//   console.log("boleh")
//   return 12 
// }

export default App
