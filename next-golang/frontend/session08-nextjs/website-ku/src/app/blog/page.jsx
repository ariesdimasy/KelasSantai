import Link from "next/link";

export const metadata = {
  title: "Blog",
  // Hasil: "Tentang Kami | WebsiteKu"
  description: "Blog List",
  openGraph: {
    title: "Blog — WebsiteKu",
    images: ["/og-about.jpg"],
  },
};


const getBlogs = async function (){
    const data  = await fetch("https://jsonplaceholder.typicode.com/posts")
    const blogs = await data.json()
    return blogs
}

export default async function Blog(){

    const blogList = await getBlogs()

    return (<div className="w-[80%] mx-auto py-5">
       
        <h1 className="text-4xl font-bold"> Blog List </h1>
        <div>
            <ul>
                {blogList.map(item => {
                    return (<li className="my-5"><Link href={"/blog/"+item.id}>{item.title}</Link></li>)
                })}
            </ul>
        </div>
    </div>)
}