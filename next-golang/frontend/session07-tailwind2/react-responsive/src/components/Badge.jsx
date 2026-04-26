export default function Badge(props){

    if(props.type === "active"){
        return (<span class="px-2.5 py-0.5 rounded-full text-xs
                    font-semibold bg-green-100 text-green-800" {...props}>
        {props.text}
        </span>
        )
    } else if(props.type === "pending") {
        return (<span class="px-2.5 py-0.5 rounded-full text-xs
                    font-semibold bg-yellow-100 text-yellow-800" {...props}>
        {props.text}
        </span>
        )
    }

    return (<span class="px-2.5 py-0.5 rounded-full text-xs
                    font-semibold bg-blue-100 text-blue-800" {...props}>
        {props.text}
    </span>)
   
}