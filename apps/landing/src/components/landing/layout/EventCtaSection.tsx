import { Button } from "@/components/ui/button";
import { EVENT_URL } from "@/lib/utils";
import { QrCode, GraduationCap, CalendarCheck, Users } from "lucide-react";

const features = [
  { icon: CalendarCheck, label: "Webinar Interaktif" },
  { icon: QrCode, label: "Absensi QR Real-Time" },
  { icon: GraduationCap, label: "Sertifikat Otomatis" },
  { icon: Users, label: "Manajemen Peserta" },
];

export function EventCtaSection() {
  return (
    <section
      id="cta-event"
      className="pt-0 pb-24 md:pb-32 bg-white relative overflow-visible"
    >
      <div className="relative z-0 mx-auto max-w-6xl px-6 md:px-0">
        {/* Mobile layout */}
        <div className="md:hidden relative z-10 w-full text-left mb-12">
          <div className="flex items-center gap-2 mb-6">
            <img
              src="/image/logo/crave-event-logo.png"
              alt="Crave Event Logo"
              className="h-9 sm:h-11 w-auto"
            />
            <span className="font-bold text-2xl sm:text-3xl tracking-tight text-slate-900">
              Crave Event
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 leading-[1.1] text-slate-900">
            Kelola webinar & acara anda dengan mudah
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mb-8 max-w-md">
            Platform webinar interaktif, absensi QR real-time, dan terbitkan
            sertifikat digital otomatis — semua dalam satu dashboard.
          </p>
          <Button
            asChild
            className="h-12 sm:h-14 rounded-full bg-[#0a84ff] px-8 sm:px-10 text-base sm:text-lg font-bold text-white hover:bg-[#0056b3] hover:scale-105 transition-all shadow-xl"
          >
            <a href={EVENT_URL}>Coba Crave Event</a>
          </Button>
        </div>

        {/* Desktop / tablet panel */}
        <div className="relative rounded-[2rem] sm:rounded-[3rem] bg-[#0a84ff] px-6 py-10 md:px-12 md:py-16 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between h-auto md:min-h-[420px] overflow-hidden">
          {/* Watermark text */}
          <div className="absolute inset-0 overflow-hidden rounded-[2rem] sm:rounded-[3rem] pointer-events-none flex items-center justify-center">
            <h1 className="text-[40vw] md:text-[20rem] leading-none font-bold text-white/10 tracking-tighter select-none">
              event
            </h1>
          </div>

          {/* Left: content */}
          <div className="relative z-10 w-full md:w-[58%] text-left text-white">
            <div className="flex items-center gap-3 mb-6">
              <img
                src="/image/logo/crave-event-logo.png"
                alt="Crave Event Logo"
                className="h-9 sm:h-11 w-auto"
              />
              <span className="font-bold text-2xl sm:text-3xl tracking-tight text-white">
                Crave Event
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-[1.1] max-w-xl">
              Kelola webinar & <br /> acara anda
            </h2>
            <p className="text-base sm:text-lg text-white/80 mb-8 max-w-lg">
              Platform webinar interaktif, absensi QR real-time, dan terbitkan
              sertifikat digital otomatis — semua dalam satu dashboard.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 mb-8">
              {features.map((f) => (
                <span
                  key={f.label}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs sm:text-sm font-medium text-white backdrop-blur-sm"
                >
                  <f.icon className="size-4" />
                  {f.label}
                </span>
              ))}
            </div>

            <Button
              asChild
              className="h-12 sm:h-14 rounded-full bg-white px-8 sm:px-10 text-base sm:text-lg font-bold text-[#0a84ff] hover:bg-slate-50 hover:scale-105 transition-all shadow-xl"
            >
              <a href={EVENT_URL}>Coba Crave Event</a>
            </Button>
          </div>

          {/* Right: logo showcase */}
          <div className="relative z-10 hidden md:flex w-[38%] h-full items-center justify-center self-stretch">
            <div className="relative">
              <div className="absolute inset-0 blur-3xl bg-white/20 rounded-full" />
              <img
                src="/image/logo/crave-event-logo.png"
                alt="Crave Event"
                className="relative h-48 w-auto drop-shadow-[0_20px_35px_rgba(0,0,0,0.3)]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
