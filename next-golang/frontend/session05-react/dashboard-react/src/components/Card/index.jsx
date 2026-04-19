import style from "./card.module.css"

export default function Card(props) {

    return (
        <div key={props.index} className={style.card}>
            <h2>{props.name}</h2>
            <p>{props.desc}</p>
        </div>
    )
}

export function Card2(props){
    return (
        <div className={style.card} >
            <h3><input type="checkbox" name="done" /> {props.title}</h3>
            <div>Date : {props.createdAt}</div>
        </div>
    )
}