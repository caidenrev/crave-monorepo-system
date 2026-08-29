import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Logo } from "@/components/landing/ui/Logo";
import { POS_URL } from "@/lib/utils";
import {
  Navbar,
  NavBody,
  NavItems,
  NavbarButton,
  MobileNav,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/navbar";

const NAV = ["Product", "Solution", "Features", "Testimonials", "FAQ"];

export function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Navbar>
      {}
      <NavBody>
        <Logo isScrolled={isScrolled} />
        <NavItems items={NAV.map((item) => ({ name: item, link: `#${item.toLowerCase()}` }))} />
        <div className="flex justify-end hidden lg:flex">
          <NavbarButton href={POS_URL}>Coba Sekarang</NavbarButton>
        </div>
      </NavBody>

      {}
      <MobileNav isOpen={isMobileMenuOpen}>
        <MobileNavHeader>
          <Logo isScrolled={isScrolled} />
          {isScrolled ? (
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-900"
            />
          ) : (
            <NavbarButton
              href={POS_URL}
              variant="outline"
              className="text-white border-white/50 hover:bg-white/10 px-4 py-1.5 text-xs"
            >
              Coba Sekarang
            </NavbarButton>
          )}
        </MobileNavHeader>
        <MobileNavMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}>
          <motion.div
            className="flex flex-col gap-2 w-full"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
              visible: { transition: { staggerChildren: 0.08 } },
              hidden: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
            }}
          >
            {NAV.map((item, idx) => {
              const num = String(idx + 1).padStart(2, "0");
              return (
                <motion.a
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { type: "spring", stiffness: 300, damping: 24 },
                    },
                  }}
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setIsMobileMenuOpen(false);
                    window.dispatchEvent(
                      new CustomEvent("start-page-transition", {
                        detail: { href: `#${item.toLowerCase()}`, name: item },
                      }),
                    );
                  }}
                  className="flex flex-col py-2 relative overflow-hidden group text-slate-900 dark:text-slate-100 hover:text-[#1B5CFE] transition-colors"
                >
                  <div className="flex items-start">
                    <span className="text-4xl sm:text-5xl font-black uppercase tracking-tighter leading-none">
                      {item}
                    </span>
                    <span className="text-sm sm:text-base font-semibold text-[#1B5CFE] ml-1 mt-1">
                      {num}
                    </span>
                  </div>
                </motion.a>
              );
            })}

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { type: "spring", stiffness: 300, damping: 24 },
                },
              }}
              className="mt-2"
            >
              <NavbarButton
                href={POS_URL}
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full"
              >
                Coba Sekarang
              </NavbarButton>
            </motion.div>
          </motion.div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
