"use client"
import {useState, useEffect} from "react"
import axios from "axios"
import ProductCard from "./ProductCard"

export default function ProductList(){

    const [filterName , setFilterName] = useState("")
    const [products, setProducts] = useState([])

    const getFilterProduct = async () => {
        const data = await axios.get(`https://dummyjson.com/products/search?q=${filterName}&limit=10&skip=0&select=title,price&`)
        const products = data.data.products
        setProducts(products)
    }

    const getProducts = async () => {
        const data = await axios.get(`https://dummyjson.com/products/?limit=10&skip=0&select=title,price&`)
        const products = data.data.products
        setProducts(products)
    }

    useEffect(() => {
        getProducts()
    },[])

    return (
        <div>
            <div id="filter" className="">
                <input type="text" value={filterName} onChange={(event) => setFilterName(event.target.value)} 
                className="p-5 w-full border-2 border-gray-100 "  />
                <button onClick={() => getFilterProduct()}> Search </button>
                <button onClick={() => getProducts()}>Clear</button>
            </div>
             <div className="py-10 flex flex-row flex-wrap gap-5 ">

                {products ? products?.map((item, index) => {
                    return <ProductCard item={item} key={index} />
                }) : "No Product"}
                
            </div>
        </div>
       
    )
}