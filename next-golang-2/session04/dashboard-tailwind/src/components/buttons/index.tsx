// <!-- Button variants -->

function ButtonPrimary(props:any){
    return (
        <button className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                    text-white font-semibold px-5 py-2.5 rounded-lg
                    transition duration-200 shadow-sm hover:shadow-md">
        {props.children}
        </button>
    )
}
// <!-- Primary -->

function ButtonSecondary(props:any) {
    return (<button className="border border-gray-300 hover:border-blue-600
               bg-white hover:bg-blue-50 text-gray-700
               hover:text-blue-600 font-semibold px-5 py-2.5
               rounded-lg transition duration-200">
  {props.children}
</button>)
}
// <!-- Outlined / Secondary -->


// <!-- Danger -->
function ButtonDanger(props:any) {
    return (<button className="bg-red-500 hover:bg-red-600 text-white
               font-semibold px-5 py-2.5 rounded-lg transition">
  {props.children}
</button>)
}


export default function Button(props:any){
    if (props.primary) {
        return <ButtonPrimary {...props} />
    } else if (props.secondary) {
        return <ButtonSecondary {...props} />
    } else if(props.danger) {
        return <ButtonDanger {...props} />
    } else {
        return <ButtonPrimary {...props} />
    }
}
