"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Search,
  Building,
  CheckCircle2,
} from "lucide-react";

export default function FeatureCards() {
  const router = useRouter();

  const handleCardClick = (title: string) => {
    if (title === "Register Complaint") {
      const user = typeof window !== "undefined" ? localStorage.getItem("complaint_user") : null;
      if (user) {
        router.push("/register-complaint");
      } else {
        router.push("/login?redirect=/register-complaint");
      }
    } else if (title === "Track Status") {
      const el = document.getElementById("track");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const cards = [
    {
      title: "Register Complaint",
      desc: "Submit your college or course complaint with photos and documents safely.",
      icon: <FileText size={22} className="text-[#1e40af]" />,
      bg: "bg-blue-50 border-blue-200/80",
      clickable: true,
    },
    {
      title: "Track Status",
      desc: "Check the progress and status of your complaint anytime using your Complaint ID.",
      icon: <Search size={22} className="text-[#1e40af]" />,
      bg: "bg-blue-50 border-blue-200/80",
      clickable: true,
    },
    {
      title: "Transparent Process",
      desc: "Handled directly by official AICTE officers with clear updates.",
      icon: <Building size={22} className="text-[#1e40af]" />,
      bg: "bg-blue-50 border-blue-200/80",
      clickable: false,
    },
    {
      title: "Timely Resolution",
      desc: "Fast and fair resolution for students, parents, and teachers.",
      icon: <CheckCircle2 size={22} className="text-emerald-600" />,
      bg: "bg-emerald-50 border-emerald-200/80",
      clickable: false,
    },
  ];

  return (
    <section className="w-full px-6 sm:px-10 lg:px-12 py-8 lg:py-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div
            key={idx}
            onClick={() => card.clickable && handleCardClick(card.title)}
            className={`group flex items-start gap-4 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 hover:-translate-y-1 ${
              card.clickable ? "cursor-pointer" : ""
            }`}
          >
            {/* Royal Icon Frame */}
            <div
              className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border ${card.bg} transition-transform duration-200 group-hover:scale-110 shadow-xs`}
            >
              {card.icon}
            </div>

            {/* Text Block */}
            <div className="flex flex-col">
              <h3 className="text-base font-bold text-[#0b1e36] group-hover:text-[#1e40af] transition-colors leading-snug">
                {card.title}
              </h3>
              <p className="mt-1.5 text-xs text-slate-500 leading-relaxed font-normal">
                {card.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
