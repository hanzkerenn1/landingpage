export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t bg-white">
      <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-600">
        © {year} KIU MEDIA. All rights reserved.
      </div>
    </footer>
  );
}

