import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full px-6 sm:px-10 lg:px-14 py-5 border-t border-slate-200 bg-white/70 backdrop-blur-xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
        <p className="text-center sm:text-left">
          © {new Date().getFullYear()} AICTE - Institution Complaint Monitoring Portal. All Rights Reserved.
        </p>

        <div className="flex items-center gap-5 sm:gap-6">
          <Link href="#privacy" className="hover:text-[#1e40af] transition-colors no-underline">
            Privacy Policy
          </Link>
          <span className="text-slate-300">•</span>
          <Link href="#terms" className="hover:text-[#1e40af] transition-colors no-underline">
            Terms of Use
          </Link>
          <span className="text-slate-300">•</span>
          <Link href="tel:1800112233" className="hover:text-[#1e40af] font-semibold transition-colors no-underline text-slate-600">
            Helpdesk: 1800-11-2233
          </Link>
        </div>
      </div>
    </footer>
  );
}
