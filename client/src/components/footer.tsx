import { Music, LayoutDashboard } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Music className="w-5 h-5 text-green-400" />
            <span className="text-lg font-semibold">ThisSongThatTime</span>
          </div>

          <div className="text-sm text-gray-400 text-center md:text-right">
            <div className="mb-2">
              <Link href="/dashboard" className="inline-flex items-center space-x-1 text-green-400 hover:text-green-300 transition-colors">
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
            </div>
            <p>© {currentYear} ThisSongThatTime. All rights reserved.</p>
            <p className="mt-1">Share the memories, moments and emotions behind your favourite songs</p>
          </div>
        </div>
      </div>
    </footer>
  );
}