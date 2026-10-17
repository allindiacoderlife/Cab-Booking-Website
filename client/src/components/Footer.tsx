import React from "react";
import { Globe, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-black text-white pt-16 pb-12 border-t border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top: Uber wordmark & Help */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 border-b border-neutral-800">
          <div className="text-3xl font-black tracking-tighter">Uber</div>
          <a
            href="#help"
            className="text-sm font-semibold hover:text-neutral-400 transition underline underline-offset-4"
          >
            Visit Help Center
          </a>
        </div>

        {/* 4-column Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div className="space-y-3">
            <h4 className="font-bold text-white">Company</h4>
            <ul className="space-y-2 text-neutral-400 text-xs">
              <li><a href="#" className="hover:text-white transition">About us</a></li>
              <li><a href="#" className="hover:text-white transition">Our offerings</a></li>
              <li><a href="#" className="hover:text-white transition">Newsroom</a></li>
              <li><a href="#" className="hover:text-white transition">Investors</a></li>
              <li><a href="#" className="hover:text-white transition">Blog</a></li>
              <li><a href="#" className="hover:text-white transition">Careers</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white">Products</h4>
            <ul className="space-y-2 text-neutral-400 text-xs">
              <li><a href="#" className="hover:text-white transition">Ride</a></li>
              <li><a href="#" className="hover:text-white transition">Drive</a></li>
              <li><a href="#" className="hover:text-white transition">Deliver</a></li>
              <li><a href="#" className="hover:text-white transition">Eat</a></li>
              <li><a href="#" className="hover:text-white transition">Uber for Business</a></li>
              <li><a href="#" className="hover:text-white transition">Uber Freight</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white">Global citizenship</h4>
            <ul className="space-y-2 text-neutral-400 text-xs">
              <li><a href="#" className="hover:text-white transition">Safety</a></li>
              <li><a href="#" className="hover:text-white transition">Diversity and Inclusion</a></li>
              <li><a href="#" className="hover:text-white transition">Sustainability</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white">Travel</h4>
            <ul className="space-y-2 text-neutral-400 text-xs">
              <li><a href="#" className="hover:text-white transition">Reserve</a></li>
              <li><a href="#" className="hover:text-white transition">Airports</a></li>
              <li><a href="#" className="hover:text-white transition">Cities</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Utility Bar */}
        <div className="pt-8 border-t border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-xs text-neutral-500">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-white">
              <Globe className="h-4 w-4" />
              <span>English</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <MapPin className="h-4 w-4" />
              <span>New Delhi</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <span>© 2026 Uber Technologies Inc. Full-Stack Clone</span>
            <a href="#" className="hover:text-white transition">Privacy</a>
            <a href="#" className="hover:text-white transition">Accessibility</a>
            <a href="#" className="hover:text-white transition">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
