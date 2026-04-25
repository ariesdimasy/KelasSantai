export default function Navbar(){
    return (<nav className="flex items-center justify-between py-4 px-6 borde-y-gray border-y-2">
        <div className="flex items-center gap-3">
            <span className="text-xl"> ADY </span>
            <span className="font-bold"> Brand</span>
        </div>
        <div className="flex gap-6">
            <a className="text-gray-600 hover:text-blue-600"> Fitur </a>
            <a className="text-gray-600 hover:text-blue-600"> Harga </a>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg"> Daftar </button>
        </div>
    </nav>)
}