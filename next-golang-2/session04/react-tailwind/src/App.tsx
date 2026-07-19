
import './App.css'

function App() {

  return (
    <>
     <h1 className='text-4xl font-bold text-center'> Belajar Tailwind </h1>
     
     <nav className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-3">
        <span className="text-xl">🚀</span>
        <span className="font-bold">Brand</span>
      </div>
      <div className="flex gap-6">
        <a className="text-gray-600 hover:text-blue-600">Fitur</a>
        <a className="text-gray-600 hover:text-blue-600">Harga</a>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
          Daftar
        </button>
      </div>
    </nav>

    {/* <!-- Kartu berjajar --> */}
    <div className="flex gap-4 flex-wrap">
      <div className="flex-1 min-w-[200px] bg-white p-6 rounded-xl shadow">
        Kartu 1
      </div>
      <div className="flex-1 min-w-[200px] bg-white p-6 rounded-xl shadow">
        Kartu 2
      </div>
       <div className="flex-1 min-w-[200px] bg-white p-6 rounded-xl shadow">
        Kartu 3
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-5">
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

    {/* <!--
      Tailwind = Mobile First
      Tanpa prefix = semua layar (mobile)
      xs  = 0 - 320px
            320px - 639px
      sm: = 640px ke atas sampai 767px
      md: = 768px ke atas
      lg: = 1024px ke atas
      xl: = 1280px ke atas
    --> */}
{/* <!-- Grid responsif --> */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  ...
</div>

{/* <!-- Text responsif --> */}
<h1 className="text-3xl md:text-5xl lg:text-6xl font-bold">
  Heading yang membesar di desktop
</h1>

{/* <!-- Navbar: sembunyikan menu di mobile --> */}
<div className="hidden md:flex items-center gap-6">
  <a>Fitur</a>
  <a>Harga</a>
</div>

{/* <!-- Padding responsif --> */}
<section className="px-4 md:px-8 lg:px-16 py-12 md:py-20"></section>


    {/* <!-- Hover: ubah warna --> */}
<button className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded">
  Hover untuk gelap
</button>

{/* <!-- Hover: scale up --> */}
<div className="hover:scale-105 transition duration-200">
  Besar saat hover
</div>

{/* <!-- Hover: shadow muncul --> */}
<div className="shadow hover:shadow-2xl transition duration-300">
  Shadow membesar
</div>

{/* <!-- Hover: tombol naik --> */}
<button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition duration-200 hover:-translate-y-1 hover:shadow-lg active:translate-y-0">
  Tombol Profesional
</button>

{/* <!-- Focus: untuk input --> */}
<input className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg px-3 py-2 outline-none" />

{/* <!-- Disabled state --> */}
<button className="bg-gray-300 text-gray-500 cursor-not-allowed px-4 py-2 rounded disabled:opacity-50">Nonaktif</button>


     <p className='bg-blue-800 text-2xl text-white'> Lorem Ipsum sit dolor amet</p>

     <div className="m-[25px] p-[25px] border-2 border-b-cyan-900
      bg-emerald-700 text-white font-semibold
      rounded-xl shadow-lg
      ">
        Padding dan Margin Fleksibel
      </div>

      <div className='bg-white rounded-xl border border-gray-100 shadow-lg p-6 
      hover:shadow-2xl transition duration-200'>
          Title : Product Name
      </div>
{/* 
     <!-- Font Weight --> */}
    <p className="font-thin">Tipis (100)</p>
    <p className="font-normal">Normal (400)</p>
    <p className="font-semibold">Semibold (600)</p>
    <p className="font-bold">Bold (700)</p>
    <p className="font-extrabold">Extrabold (800)</p>

    {/* <!-- Alignment & Decoration --> */}
    <p className="text-center">Rata tengah</p>
    <p className="text-right">Rata kanan</p>
    <p className="uppercase tracking-widest">SPASI HURUF</p>
    <p className="italic leading-relaxed">Miring + jarak baris</p>

    {/* <!-- Padding semua sisi --> */}
    <div className="p-4">  padding: 16px semua  </div>
    <div className="p-0">  padding: 0           </div>
    <div className="p-8">  padding: 32px semua  </div>

    {/* <!-- Padding arah tertentu --> */}
    <div className="pt-4 pb-8"> atas 16px, bawah 32px </div>
    <div className="px-6 py-3"> h.24px, v.12px </div>

    {/* <!-- Margin --> */}
    <div className="m-4">    margin semua 16px </div>
    <div className="mt-8">   margin atas 32px  </div>
    <div className="mx-auto"> center horizontal! </div>

    {/* <!-- Gap untuk flex/grid --> */}
    <div className="flex gap-4">     gap 16px antar item </div>
    <div className="grid grid-cols-3 gap-6">  gap 24px </div>

    {/* <!-- Container pattern --> */}
    <div className="max-w-6xl mx-auto px-4">
      Konten tercentering!
    </div>

      

      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-2xl">
      Gradient
    </div>





    </>
  )
}

export default App
