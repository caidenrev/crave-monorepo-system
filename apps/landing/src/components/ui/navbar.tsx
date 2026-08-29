"use client";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { LucideMenu, X } from "lucide-react";
import {
  motion,
  AnimatePresence,
  LayoutGroup,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";

import React, { useRef, useState } from "react";

interface NavbarProps {
  children: React.ReactNode;
  className?: string;
}

interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface NavItemsProps {
  items: {
    name: string;
    link: string;
  }[];
  className?: string;
  onItemClick?: () => void;
}

interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
  isOpen?: boolean;
}

interface MobileNavHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileNavMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const Navbar = ({ children, className }: NavbarProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const [visible, setVisible] = useState<boolean>(false);

  useMotionValueEvent(scrollY, "change", (latest: number) => {
    if (latest > 0) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  });

  return (
    <motion.div
      ref={ref}
      
      className={cn("fixed inset-x-0 top-2.5 z-[100] w-full", className)}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<{ visible?: boolean }>, { visible })
          : child,
      )}
    </motion.div>
  );
};

export const NavBody = ({ children, className, visible }: NavBodyProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(10px)" : "none",
        boxShadow: visible
          ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
          : "none",
        width: visible ? "80%" : "100%",
        y: visible ? 10 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 50,
        duration: 1,
      }}
      style={{
        minWidth: "800px",
      }}
      className={cn(
        "relative z-[60] mx-auto hidden w-full max-w-6xl flex-row items-center justify-between self-start rounded-bl-2xl rounded-br-2xl bg-transparent px-6 py-4 lg:flex dark:bg-frame transition-colors duration-300 text-white",
        visible && "bg-white/90 dark:bg-[#0a0a0a] rounded-full text-slate-900",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const NavItems = ({ items, className, onItemClick }: NavItemsProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  
  return (
    <motion.div
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-2 text-sm font-medium transition duration-200 lg:flex lg:space-x-4",
        className,
      )}
    >
      <LayoutGroup>
        {items.map((item, idx) => (
          <a
            onMouseEnter={() => setHovered(idx)}
            onClick={(e) => {
              if (item.link.startsWith("#")) {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent("start-page-transition", {
                  detail: { href: item.link, name: item.name }
                }));
              }
              if (onItemClick) onItemClick();
            }}
            className="relative px-4 py-2 font-medium z-10"
            key={`link-${idx}`}
            href={item.link}
          >
            {hovered === idx && (
              <motion.div
                layoutId="nav-item-hover"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="absolute inset-0 h-full w-full rounded-full bg-white/20 dark:bg-neutral-800 -z-10"
              />
            )}
            <span className="relative z-20">{item.name}</span>
          </a>
        ))}
      </LayoutGroup>
    </motion.div>
  );
};

export const MobileNav = ({ children, className, visible, isOpen }: MobileNavProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(10px)" : "none",
        boxShadow: visible
          ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
          : "none",
        width: visible ? "90%" : "100%",
        paddingRight: visible ? "12px" : "0px",
        paddingLeft: visible ? "12px" : "0px",
        borderRadius: visible ? (isOpen ? "24px" : "32px") : "0px",
        y: visible ? 20 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 50,
      }}
      className={cn(
        "relative z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between bg-transparent px-4 py-4 lg:hidden transition-colors overflow-hidden",
        visible && "bg-white/90 dark:bg-frame",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const MobileNavHeader = ({ children, className }: MobileNavHeaderProps) => {
  return (
    <div className={cn("flex w-full flex-row items-center justify-between", className)}>
      {children}
    </div>
  );
};

export const MobileNavMenu = ({ children, className, isOpen, onClose }: MobileNavMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className={cn(
            "w-full flex flex-col items-start justify-start pt-6 pb-2",
            className,
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const MobileNavToggle = ({ isOpen, onClick, className }: { isOpen: boolean; onClick: () => void; className?: string }) => {
  return (
    <div 
      className={cn("cursor-pointer relative flex items-center justify-center", className)} 
      onClick={onClick}
    >
      <svg 
        viewBox="0 0 32 32" 
        className={cn(
          "h-7 w-7 transition-transform duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
          isOpen ? "-rotate-45" : ""
        )}
      >
        <path 
          className="fill-none stroke-current stroke-[3] rounded-full [stroke-linecap:round] [stroke-linejoin:round] transition-all duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{
            strokeDasharray: isOpen ? "20 300" : "12 63",
            strokeDashoffset: isOpen ? "-32.42" : "0"
          }}
          d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22" 
        />
        <path 
          className="fill-none stroke-current stroke-[3] rounded-full [stroke-linecap:round] [stroke-linejoin:round]" 
          d="M7 16 27 16" 
        />
      </svg>
    </div>
  );
};


export const NavbarButton = ({
  href,
  as: Tag = "a",
  children,
  className,
  variant = "primary",
  ...props
}: {
  href?: string;
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "dark" | "gradient" | "outline";
} & (React.ComponentPropsWithoutRef<"a"> | React.ComponentPropsWithoutRef<"button">)) => {
  const baseStyles =
    "px-5 py-2 rounded-full text-sm font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-block text-center";

  const variantStyles = {
    primary:
      "bg-white text-[#1B5CFE] shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]",
    secondary: "bg-transparent shadow-none dark:text-white",
    dark: "bg-black text-white shadow-[0_0_24px_rgba(34,_42,_53,_0.06)]",
    gradient:
      "bg-gradient-to-b from-blue-500 to-blue-700 text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset]",
    outline: "border border-current bg-transparent",
  };

  return (
    <Tag
      href={href || undefined}
      className={cn(baseStyles, variantStyles[variant], className)}
      onClick={(e: React.MouseEvent) => {
        if (href && href.startsWith("#")) {
          e.preventDefault();
          window.dispatchEvent(
            new CustomEvent("start-page-transition", {
              detail: { href, name: typeof children === "string" ? children : "Action" },
            }),
          );
        }
        if (props.onClick) {
          (props.onClick as any)(e);
        }
      }}
      {...props}
    >
      {children}
    </Tag>
  );
};
