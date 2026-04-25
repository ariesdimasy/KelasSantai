export default function FeatureCard(props) {
    return (<div className="bg-white rounded-xl shadow p-6 text-center">
        <div className="text-4xl md-4 ">{props.logo}</div>
        <h3 className="text-xl font-bold mb-2">{props.title}</h3>
        <div className="text-gray-500">{props.desc}</div>
    </div>)
}