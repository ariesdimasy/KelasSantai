"use client"
import { useState } from "react"
export default function Counter(){

    const [counter, setCounter] = useState(0)

    return (<div className="w-[80%] p-20 mx-auto border-zinc-950 border-2 flex flex-row">
        <button className="w-10" onClick={() => setCounter(counter-1)}> - </button>
        <div className="text-2xl">{counter}</div>
        <button className="w-10" onClick={() => setCounter(counter+1)}> + </button>
    </div>)
}