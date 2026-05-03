import Image from "next/image"
import Link from "next/link"

export default function ProductCard(props){
    return (<div key={props.key} className="border-gray-100 border-2 p-2 w-[20%]">
        <Link href={`/products/${props.item.id}`}>
            <Image width={200} height={150} alt={props.item.title} 
            src={'/images/products/'+props.item.id+".jpg"} priority className="h-auto" />
            <h3 className="text-xl">{props.item.title}</h3>
            <p>{props.item.price}</p>
        </Link>
    </div>)
}