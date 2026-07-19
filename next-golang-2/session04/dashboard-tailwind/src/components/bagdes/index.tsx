interface IBadgeProps {
    active?:boolean
    pending?:boolean
    error?:boolean
    new?:boolean
    children:string
}


function BadgeActive(props:IBadgeProps) {
    return (<span className="px-2.5 py-0.5 rounded-full text-xs
                font-semibold bg-green-100 text-green-800">
    {props.children}

    </span>)
}

function BadgePending(props:IBadgeProps) {
    return (<span className="px-2.5 py-0.5 rounded-full text-xs
             font-semibold bg-yellow-100 text-yellow-800">
  {props.children}
</span>)
}

function BadgeError(props:IBadgeProps){
    return (<span className="px-2.5 py-0.5 rounded-full text-xs
             font-semibold bg-red-100 text-red-800">
  {props.children}
</span>)
}

function BadgeNew(props:IBadgeProps){
    return (<span className="px-2.5 py-0.5 rounded-full text-xs
             font-semibold bg-blue-100 text-blue-800">
  {props.children}
</span>)

}

export default function Badge(props:IBadgeProps) {
    if(props.active) return <BadgeActive {...props} />
    else if(props.pending) return <BadgePending {...props} />
    else if(props.error) return <BadgeError {...props} />
    else if(props.new) return <BadgeNew {...props} />
    else return <BadgeActive {...props} />
}

