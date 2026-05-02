// generateMetadata dipanggil sebelum render
// export async function generateMetadata({ params }) {
//   const artikel = await getArtikel(params.slug);
  
//   return {
//     title: artikel.judul,
//     description: artikel.ringkasan,
//     openGraph: {
//       title: artikel.judul,
//       description: artikel.ringkasan,
//       images: [{
//         url: artikel.gambar,
//         width: 1200,
//         height: 630,
//       }],
//     },
//   };
// }

const getDetailBlog = async function (id){
    const data = await fetch("https://jsonplaceholder.typicode.com/posts/"+id)
    const blogDetail = await data.json()
    return blogDetail
}

export default async function BlogDetail(props){

    const { slug } = await props.params
    const blogDetail = await getDetailBlog(slug)

    return (<div className="py-10 mx-auto w-[80%]">
        <h1> Judul Blog : {blogDetail.title} </h1>
        <hr /> 

        <p> {blogDetail.body} </p>
    </div>)
}