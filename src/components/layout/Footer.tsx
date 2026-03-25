import Link from 'next/link'
import { Bus, Phone, Mail, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                <Bus className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-lg text-white">
                Bus<span className="text-brand-400">Book</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed">
              Your trusted partner for safe and comfortable bus travel across Maharashtra and beyond.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white text-sm mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/routes" className="hover:text-white transition-colors">Find Buses</Link></li>
              <li><Link href="/bookings" className="hover:text-white transition-colors">My Bookings</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Register</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white text-sm mb-4">Popular Routes</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="hover:text-white transition-colors cursor-pointer">Nagpur → Mumbai</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Mumbai → Pune</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Nagpur → Pune</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Nashik → Aurangabad</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white text-sm mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <span>1800-123-4567</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <span>support@busbook.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span>Yavatmal, Maharashtra 445001</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs">© {new Date().getFullYear()} BusBook. All rights reserved.</p>
          <p className="text-xs">Built for CMCS, Yavatmal · BCA Project 2025–2026</p>
        </div>
      </div>
    </footer>
  )
}
