
import './App.css'
import Box from './components/Box'
import Card from "./components/Card"
import MyCard from './components/MyCard'
import Navbar from './components/Navbar'
import FeatureCard from './components/FeatureCard'

function App() {
  
  const cardCSS = "bg-gradient-to-r from-blue-500 to-purple-600 h-[200px] w-[200px] text-white"
  
  const features = [
    {
      logo:"Bolt",
      title:"Cepat",
      desc:"Performa Tinggi"
    },{
      logo:"Secure",
      title:"Aman",
      desc:"Terlindungi"
    },{
      logo:"Globe",
      title:"Mudah",
      desc:"Antarmuka Intuitif"
    }
  ]
  return (
    <>
      <Navbar />
      <section id="center">
        <div className="hero">
          <h1 className='text-6xl font-bold text-blue-600'>Get started</h1>
          <h2 className='text-3xl text-green-800'> Make it simple </h2>
        </div>
        <div>
          <p className='text-sm text-blue-500'> Ukuran dalam text 1 </p>
          <p className='text-sm text-blue-600'> Ukuran dalam text 2 </p>
        </div>
        <div>
          <div className='font-bold text-black'> kita jadikan text ini bold </div>
        </div>
        <div>
          <div className='text-left uppercase'> Posisi Kiri </div>
          <div className='text-right lowercase'> Posisi Kiri </div>
        </div>
        <div className='flex gap-2'>
          <Box />
          <Box />
        </div>
        <div className='grid grid-cols-4 gap-2'>
          <Box />
          <Box />
        </div>
        <div className='w-max mx-auto p-4 bg-blue-500'>
          Content Center
        </div>
        <div className='flex gap-6'>
          <Card title="Card 1" className={cardCSS+" "} />
          <Card title="Card 2" className={cardCSS+" border-black border-8 border-solid"} />
          <Card title="Card 3" className={cardCSS+" rounded-xl shadow-lg"}></Card>
          <Card title="Card 4" className={"bg-white rounded-xl border border-gray-100 shadow-lg p-6 hover:shadow-2xl transition duration-200"} />
        </div>
        <div className='flex gap-4 flex-wrap'>
          <MyCard title="Aries Dimas" />
          <MyCard title="Rian D ikison"/>
          <MyCard title="Citra" />
          <MyCard title="Damian"/>
          <MyCard title="Aries Dimas" />
          <MyCard title="Rian D ikison"/>
          <MyCard title="Citra" />
          <MyCard title="Damian"/>
        </div>
        
      </section>
      <section>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {features.map((item, index) => <FeatureCard 
            key={index}  
            title={item.title}
            logo={item.logo}
            desc={item.desc}
          />)}
        </div>
      </section>
      <section>
        <div className='hover:scale-105 transition duration-200'>
            Besar saat hover 
        </div>

        <div className='shadow hover:shadow-2xl transition duration-300'>
            Shadow Membesar
        </div>
      </section>
      <section className='py-20'>
          
          <h1 class="text-3xl md:text-5xl lg:text-6xl font-bold">
            Heading yang membesar di desktop
          </h1>

      </section>

     
    </>
  )
}

export default App
