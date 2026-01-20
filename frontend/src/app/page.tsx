import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">HRMS Platform</h1>
        <p className="text-xl text-gray-600 mb-8">
          Multi-tenant HR Management System
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/login" className="btn-primary text-lg px-8 py-3">
            Login
          </Link>
          <Link href="/register" className="btn-secondary text-lg px-8 py-3">
            Register Your Company
          </Link>
          <Link
            href="/super-admin/login"
            className="bg-gray-800 text-white px-8 py-3 rounded-lg hover:bg-gray-900 transition-colors"
          >
            Super Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
