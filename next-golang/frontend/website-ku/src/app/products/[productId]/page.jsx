import Image from "next/image"
export async function generateMetadata({ params }) {
  const product = await getProductDetail(params.id);
  if (!product) return { title: "Produk tidak ditemukan" };
  return {
    title: product.title,
    description: product.description ?  product.description.slice(0, 150) : "",
  };
}

const getProductDetail = async (id) => {
    const data = await fetch("https://dummyjson.com/products/"+id,{
        next:{
            revalidate:3600
        }
    })
    const product = await data.json()
    return product
}

export default async function ProductDetail(props){

    const { productId } = await props.params
    const product = await getProductDetail(productId)

    if(!product){
        return "Gagal mengambil data product"
    }

    return (<div className="w-[80%] mx-auto py-10">
        <div className="flex flex-row gap-10 h-75 mb-10">
            <div className="w-[45%] h-full " >
                <Image alt={product.title} width={450} height={200} className="h-auto" src={"/images/products/"+product.id+".jpg"} />
            </div>
            <div className="w-[45%] h-full" >
                <h1 className="text-2xl">{product.title}</h1>
                <p>{product.price}</p>
                <span className="my-5 border-0.5 border-gray-10 p-1 bg-purple-200">
                    {product.category}
                </span>
                <div className="mt-5">
                    {product.description}
                </div>
            </div>
        </div>
        <div className="flex flex-col w-[45%] border-2 border-gray-200 p-1">
            <h3 className="text-2xl font-bold"> Reviews </h3>
            {product.reviews.length > 0 ?  product.reviews.map((item) => {
                return (<div className="border-2 border-gray-200 p-1 mb-5">
                    <div className="font-bold">{item.reviewerName}</div>
                    <div className="">{item.reviewerEmail}</div>
                    <div className="m-2"> Rating : {item.rating}</div>
                    <div>{item.comment}</div>
                </div>)
            }) : "No Review"}
        </div>
        
    </div>)
}