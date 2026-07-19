export default function Service(){
    return (<div>
         {/* <!-- Heading responsif --> */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold">
        Service
      </h1>

         {/* <!-- Grid: 1 → 2 → 3 → 4 kolom --> */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <div className="text-4xl mb-4">⚡</div>
          <h3 className="text-xl font-bold mb-2">Cepat</h3>
          <p className="text-gray-500">Performa tinggi</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h3 className="text-xl font-bold mb-2">Aman</h3>
          <p className="text-gray-500">Data terlindungi</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <div className="text-4xl mb-4">🌐</div>
          <h3 className="text-xl font-bold mb-2">Mudah</h3>
          <p className="text-gray-500">Antarmuka intuitif</p>
        </div>
      </div>

     
    </div>)
}