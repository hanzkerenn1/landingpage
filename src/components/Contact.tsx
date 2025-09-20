export default function Contact() {
  return (
    <section id="contact" className="py-16 sm:py-20">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
          Contact Us
        </h2>
        <p className="mt-4 text-gray-600">
          Ready to elevate your business? Let’s talk.
        </p>
        <div className="mt-8">
          <a
            href="mailto:info@kiumedia.com"
            className="inline-block rounded-lg border border-blue-600 px-6 py-3 text-blue-600 font-semibold shadow-sm hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            info@kiumedia.com
          </a>
        </div>
      </div>
    </section>
  );
}

