import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-4">
        404 Error
      </p>

      <h1 className="text-6xl font-black mb-6 text-black">
        Page Not Found
      </h1>

      <p className="text-gray-500 max-w-md mb-10">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <Link
        href="/"
        className="bg-black text-white px-10 py-4 font-black text-[11px] uppercase tracking-[0.2em] hover:bg-red-600 transition-all"
      >
        Back to Home
      </Link>
    </div>
  );
}
