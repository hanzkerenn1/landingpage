export default function Hero() {
  return (
    <section className="bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24 text-center">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
          Digital Marketing & Development Solutions
        </h1>
        <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
          Boost your business with expert advertising on Google, Meta, TikTok, and
          professional web development services.
        </p>
        <div className="mt-8">
          <a
            href="#contact"
            className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold shadow hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            Get Started
          </a>
        </div>
      </div>
    </section>
  );
}

