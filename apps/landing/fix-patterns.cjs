const fs = require('fs');
let content = fs.readFileSync('src/routes/index.tsx', 'utf8');

// Add imports and GridCross if not present
if (!content.includes('function GridCross')) {
  content = content.replace(
    /import \{ StripedPattern \} from "@\/components\/magicui\/striped-pattern";\n/,
    `import { StripedPattern } from "@/components/magicui/striped-pattern";\nimport { cn } from "@/lib/utils";\n\nfunction GridCross({ className }: { className?: string }) {\n  return (\n    <svg\n      className={cn("absolute text-foreground/25", className)}\n      width="31"\n      height="31"\n      viewBox="0 0 31 31"\n      fill="none"\n      xmlns="http://www.w3.org/2000/svg"\n    >\n      <path d="M15.5 0V31M0 15.5H31" stroke="currentColor" strokeWidth="3" />\n    </svg>\n  );\n}\n`
  );
}

// Map of sections to their new section classes
const sectionUpdates = [
  {
    findSection: '<section id="solution" className="mx-auto max-w-6xl overflow-hidden px-6 py-24">',
    replaceSection: '<section id="solution" className="border-b border-foreground/15">\n        <div className="relative z-0 mx-auto max-w-6xl border-x border-foreground/15 overflow-hidden px-6 py-24">\n          <GridCross className="absolute -bottom-[15.5px] -left-[15.5px] z-10" />\n          <GridCross className="absolute -bottom-[15.5px] -right-[15.5px] z-10" />\n          <StripedPattern className="!-z-10 text-foreground/20 [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black_100%)]" />',
    closeDiv: true
  },
  {
    findSection: '<section className="bg-secondary/40 py-24">\n        <div className="mx-auto max-w-6xl px-6">',
    replaceSection: '<section className="border-b border-foreground/15 bg-secondary/40">\n        <div className="relative z-0 mx-auto max-w-6xl border-x border-foreground/15 px-6 py-24">\n          <GridCross className="absolute -bottom-[15.5px] -left-[15.5px] z-10" />\n          <GridCross className="absolute -bottom-[15.5px] -right-[15.5px] z-10" />\n          <StripedPattern className="!-z-10 text-foreground/20 [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black_100%)]" />',
    closeDiv: false
  },
  {
    findSection: '<section id="about" className="mx-auto max-w-6xl px-6 py-24">',
    replaceSection: '<section id="about" className="border-b border-foreground/15">\n        <div className="relative z-0 mx-auto max-w-6xl border-x border-foreground/15 px-6 py-24">\n          <GridCross className="absolute -bottom-[15.5px] -left-[15.5px] z-10" />\n          <GridCross className="absolute -bottom-[15.5px] -right-[15.5px] z-10" />\n          <StripedPattern className="!-z-10 text-foreground/20 [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black_100%)]" />',
    closeDiv: true
  },
  {
    findSection: '<section id="features" className="mx-auto max-w-6xl px-6 py-24">',
    replaceSection: '<section id="features" className="border-b border-foreground/15">\n        <div className="relative z-0 mx-auto max-w-6xl border-x border-foreground/15 px-6 py-24">\n          <GridCross className="absolute -bottom-[15.5px] -left-[15.5px] z-10" />\n          <GridCross className="absolute -bottom-[15.5px] -right-[15.5px] z-10" />\n          <StripedPattern className="!-z-10 text-foreground/20 [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black_100%)]" />',
    closeDiv: true
  },
  {
    findSection: '<section id="product" className="bg-secondary/40 py-24">\n        <div className="mx-auto max-w-6xl px-6">',
    replaceSection: '<section id="product" className="border-b border-foreground/15 bg-secondary/40">\n        <div className="relative z-0 mx-auto max-w-6xl border-x border-foreground/15 px-6 py-24">\n          <GridCross className="absolute -bottom-[15.5px] -left-[15.5px] z-10" />\n          <GridCross className="absolute -bottom-[15.5px] -right-[15.5px] z-10" />\n          <StripedPattern className="!-z-10 text-foreground/20 [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black_100%)]" />',
    closeDiv: false
  },
  {
    findSection: '<section id="testimonials" className="mx-auto max-w-6xl px-6 py-24">',
    replaceSection: '<section id="testimonials" className="border-b border-foreground/15">\n        <div className="relative z-0 mx-auto max-w-6xl border-x border-foreground/15 px-6 py-24">\n          <GridCross className="absolute -bottom-[15.5px] -left-[15.5px] z-10" />\n          <GridCross className="absolute -bottom-[15.5px] -right-[15.5px] z-10" />\n          <StripedPattern className="!-z-10 text-foreground/20 [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black_100%)]" />',
    closeDiv: true
  },
  {
    findSection: '<section id="faq" className="bg-secondary/40 py-24">\n        <div className="mx-auto max-w-3xl px-6">',
    replaceSection: '<section id="faq" className="border-b border-foreground/15 bg-secondary/40">\n        <div className="relative z-0 mx-auto max-w-6xl border-x border-foreground/15 px-6 py-24">\n          <GridCross className="absolute -bottom-[15.5px] -left-[15.5px] z-10" />\n          <GridCross className="absolute -bottom-[15.5px] -right-[15.5px] z-10" />\n          <StripedPattern className="!-z-10 text-foreground/20 [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black_100%)]" />\n          <div className="mx-auto max-w-3xl">',
    closeDiv: true
  },
  {
    findSection: '<section id="cta" className="bg-panel px-6 py-24">\n        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">',
    replaceSection: '<section id="cta" className="border-b border-foreground/15 bg-panel">\n        <div className="relative z-0 mx-auto max-w-6xl border-x border-foreground/15 px-6 py-24">\n          <GridCross className="absolute -bottom-[15.5px] -left-[15.5px] z-10" />\n          <GridCross className="absolute -bottom-[15.5px] -right-[15.5px] z-10" />\n          <StripedPattern className="!-z-10 text-foreground/20 [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black_100%)]" />\n          <div className="grid items-center gap-12 lg:grid-cols-2">',
    closeDiv: true
  },
  {
    findSection: '<footer className="border-t border-border bg-background">\n        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-6 py-8 sm:flex sm:justify-between">',
    replaceSection: '<footer className="bg-background">\n        <div className="relative z-0 mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-x border-foreground/15 px-6 py-8 sm:flex sm:justify-between">\n          <GridCross className="absolute -bottom-[15.5px] -left-[15.5px] z-10" />\n          <GridCross className="absolute -bottom-[15.5px] -right-[15.5px] z-10" />\n          <StripedPattern className="!-z-10 text-foreground/20 [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black_100%)]" />',
    closeDiv: false
  }
];

// Add closing divs where necessary
// Wait, replacing a section start requires us to close the added wrapper div BEFORE the section ends!
// Let's use simple regex or string replacement for the closing tag.
// For sections that require closing the wrapper div, we will replace `</section>` with `</div>\n      </section>`.
// However, the `replaceSection` strings for the ones with `closeDiv: true` already replace the entire section opening tag with a `<section>` AND a `<div>`.
// It's safer to just iterate from the end and replace `</section>` for these sections.

// Because it's hard to track which `</section>` is which using pure string replacements without breaking others, I will manually patch the exact lines by line numbers or index using string splits.
// It's safer to just replace `<section...` and `</section>` using regex.

let contentLines = content.split('\\n');

// Actually, I can just do this using string matching:
sectionUpdates.forEach(update => {
  if (content.includes(update.findSection)) {
    content = content.replace(update.findSection, update.replaceSection);
  }
});

content = content.replace(/className="shadow-card rounded-full border border-border bg-card px-4 py-1\\.5 text-xs font-medium text-muted-foreground"/g, 'className="border border-foreground/15 rounded-full bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground"');

// Close the wrapper divs we opened in the 7 sections!
// We can do this by finding each section's closing `</section>` and `</footer>` and replacing it with `</div>\n      </section>`
// The sections that added a `<div>` wrapper are: solution, about, features, testimonials, faq, cta, and footer.
// The BENTO FEATURES and PRICING ones did NOT add a div, they just modified an existing `<div className="mx-auto max-w-6xl px-6">`. Wait, BENTO FEATURES replaced `<div className="mx-auto max-w-6xl px-6">` with `<div className="relative z-0 mx-auto max-w-6xl border-x border-foreground/15 px-6 py-24">`. Yes, they already had a div! So no new closing div is needed for them!
// What about the others? `solution` replaced `<section ...>` with `<section ...><div ...>`. It NEEDS a closing `</div>`.
// Let's manually replace the `</section>` tags for those specific ones.

// 1. Solution: ends with `</section>` before `<!-- BENTO FEATURES -->`
content = content.replace(/<\/section>\n\n      \{\/\* BENTO FEATURES \*\/\}/g, '  </div>\n      </section>\n\n      {/* BENTO FEATURES */}');
// 2. About us: ends before `<!-- FEATURES -->`
content = content.replace(/<\/section>\n\n      \{\/\* FEATURES \*\/\}/g, '  </div>\n      </section>\n\n      {/* FEATURES */}');
// 3. Features: ends before `<!-- PRICING -->`
content = content.replace(/<\/section>\n\n      \{\/\* PRICING \*\/\}/g, '  </div>\n      </section>\n\n      {/* PRICING */}');
// 4. Testimonials: ends before `<!-- FAQ -->`
content = content.replace(/<\/section>\n\n      \{\/\* FAQ \*\/\}/g, '  </div>\n      </section>\n\n      {/* FAQ */}');
// 5. FAQ: wait, FAQ replaced `... <div ...>` with `... <div ...> <div ...>`. It needs a closing div!
content = content.replace(/<\/section>\n\n      \{\/\* CTA \*\/\}/g, '  </div>\n        </div>\n      </section>\n\n      {/* CTA */}');
// 6. CTA: replaced `<div grid...>` with `<div wrapper><div grid...>`. It needs a closing div!
content = content.replace(/<\/section>\n\n      \{\/\* FOOTER \*\/\}/g, '  </div>\n        </div>\n      </section>\n\n      {/* FOOTER */}');
// 7. Footer: replaced `<div grid...>` with `<div wrapper>`. It does NOT need a new closing div, it replaces the existing one! No change needed.

fs.writeFileSync('src/routes/index.tsx', content);
