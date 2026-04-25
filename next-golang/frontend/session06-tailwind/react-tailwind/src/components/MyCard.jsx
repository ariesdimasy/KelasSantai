export default function MyCard(props){
    return (<div className="flex-1 min-w-[200px] border-gray border-2 bg-white p-6 rounded-xl shadow">
        { props.title }
    </div>)
}