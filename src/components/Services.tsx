type Service = {
  title: string;
  description: string;
};

const services: Service[] = [
  {
    title: "Google Ads",
    description:
      "Target the right audience and maximize ROI with our expert Google Ads management.",
  },
  {
    title: "Meta Ads",
    description:
      "Reach your customers across Facebook and Instagram with optimized ad campaigns.",
  },
  {
    title: "TikTok Ads",
    description:
      "Engage the younger audience with creative and impactful TikTok advertising.",
  },
  {
    title: "Web Development",
    description:
      "Build modern, responsive websites tailored to your business needs.",
  },
];

export default function Services() {
  return (
    <section id="services" className="py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 text-center">
          Our Services
        </h2>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s) => (
            <div
              key={s.title}
              className="rounded-lg border bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-900">{s.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

