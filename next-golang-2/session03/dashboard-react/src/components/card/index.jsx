import style from "./card.module.css"

export default function Card(props){
    return (<div className={style.card}>
        <div>Produk : {props.title}</div>
        <div>Price : {props.price}</div>
    </div>)
}