import Image from "next/image";

export default function Home() {
  return (
    <main>
      <Image
        src="/images/hero.png"
        alt="Hero Banner — wajib diisi untuk aksesibilitas!"
        width={800}        // WAJIB untuk local images
        height={400}        // WAJIB untuk local images
        priority            // Load lebih dulu (above-the-fold)
        className=" rounded-xl"
        />

      <section className="min-h-screen
        bg-gradient-to-br from-purple-50
        to-indigo-100 flex items-center
        justify-center">
        <div className="max-w-4xl mx-auto
                        px-4 text-center">
          <h1 className="text-6xl font-extrabold
                         text-gray-900 mb-6">
            Halo
            <span className="text-purple-600">
              Next.js!
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-10">
            Website modern yang cepat.
          </p>
        </div>
      </section>
    </main>

  );
}
