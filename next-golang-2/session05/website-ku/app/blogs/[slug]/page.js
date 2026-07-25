import { getArticle } from "@/actions/article";

// generateMetadata dipanggil sebelum render
export async function generateMetadata({ params }) {
  const artikel = await getArticle(params.slug);
  
  return {
    title: artikel.judul,
    description: artikel.ringkasan,
    openGraph: {
      title: artikel.judul,
      description: artikel.ringkasan,
      images: [{
        url: artikel.gambar,
        width: 1200,
        height: 630,
      }],
    },
  };
}


export default function BlogDetail({ params }){

    const artikel = getArticle(params.slug);


    return (<div>
        <h1 className="text-2xl">Title : {artikel.title}</h1>
        <hr />
    </div>)
}