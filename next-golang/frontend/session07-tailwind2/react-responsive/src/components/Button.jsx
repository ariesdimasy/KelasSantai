export default function Button(props) {
    
    if(props.type == "primary"){
        return (<button class="bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                        text-white font-semibold px-5 py-2.5 rounded-lg
                        transition duration-200 shadow-sm hover:shadow-md" {...props}>
            {props.text}
        </button>)
    }

    return (
        <button class="border border-gray-300 hover:border-blue-600
                    bg-white hover:bg-blue-50 text-gray-700
                    hover:text-blue-600 font-semibold px-5 py-2.5
                    rounded-lg transition duration-200" {...props} >
        {props.text}
        </button>
    )
}