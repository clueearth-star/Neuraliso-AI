import React from "react";
import { Star, ShieldCheck, UserCheck } from "lucide-react";

interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
}

const TESTIMONIALS: TestimonialItem[] = [
  {
    id: "devon",
    name: "Devon M.",
    role: "Age 21 • Student",
    quote: "Finally a wellness app that doesn't ask for my email.",
    rating: 5,
  },
  {
    id: "elena",
    name: "Elena R.",
    role: "Age 38 • Product Designer",
    quote: "The 4-7-8 breathing exercise helps me fall asleep within minutes without pills.",
    rating: 5,
  },
  {
    id: "robert",
    name: "Dr. Robert K.",
    role: "Age 49 • Clinical Researcher",
    quote: "Clean, completely private, and works offline on my train commute.",
    rating: 5,
  },
];

export const Testimonials: React.FC = () => {
  return (
    <section 
      id="testimonials" 
      aria-labelledby="testimonials-heading" 
      className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Real Community Stories</span>
          </div>
          <h2 id="testimonials-heading" className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            What our users say
          </h2>
          <p className="text-sm sm:text-base text-slate-300">
            Over 10,000 people take a daily mindful pause with Neuraliso.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {TESTIMONIALS.map((item) => (
            <article 
              key={item.id}
              className="wellness-card p-6 sm:p-7 flex flex-col justify-between space-y-4 border border-white/10 hover:border-white/20 transition-all bg-white/[0.03]"
            >
              <div className="space-y-3">
                <div 
                  className="flex items-center gap-1 text-amber-400" 
                  aria-label={`${item.rating} out of 5 stars`}
                >
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" aria-hidden="true" />
                  ))}
                </div>
                <blockquote className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-sm">{item.name}</div>
                  <div className="text-xs text-slate-400">{item.role}</div>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified</span>
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
