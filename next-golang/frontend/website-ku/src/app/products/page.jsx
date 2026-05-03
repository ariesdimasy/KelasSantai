import ProductCard from "@/components/ProductCard"
import ProductList from "@/components/ProductList"

export default async function Products(){

    return (<div className="w-[80%] mx-auto ">
        <h1> Products </h1>
        
        <ProductList />
    </div>)
}