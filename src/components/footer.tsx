import Link from "next/link";
import type { HTMLAttributeAnchorTarget } from "react";

export interface Links {
  group: string;
  items: {
    title: string;
    href: string;
    target: HTMLAttributeAnchorTarget;
  }[];
}

const defaultLinks: Links[] = [
  {
    group: "Navigation",
    items: [
      { title: "Home", href: "#", target: "_self" },
      { title: "About", href: "#about", target: "_self" },
      { title: "Services", href: "#services", target: "_self" },
      { title: "portfolio", href: "#portfolio", target: "_self" },
      // { title: "Testimonial", href: "#testimonial", target: "_self" },
      { title: "Contact", href: "#contact", target: "_self" },
    ],
  },
  {
    group: "Pages",
    items: [
      { title: "Portfolio", href: "/", target: "_blank" },
      { title: "Sitemap", href: "/sitemap.xml", target: "_blank" },
    ],
  },
  {
    group: "Social",
    items: [
      {
        title: "Facebook",
        href: "https://www.facebook.com/andrei.lanuza.25",
        target: "_blank",
      },
      { title: "Github", href: "https://github.com/jasmyre", target: "_blank" },
      {
        title: "LinkedIn",
        href: "https://www.linkedin.com/in/jasmyre-andrei-lanuza-092a972a1/",
        target: "_blank",
      },
    ],
  },
  {
    group: "Legal",
    items: [
      { title: "© 2025 Jasmyre", href: "#footer", target: "_self" },
      { title: "All Rights Reserved", href: "#footer", target: "_self" },
    ],
  },
];

interface FooterSectionProps {
  links?: Links[];
}

// biome-ignore lint/suspicious/useAwait: cache component should be an async function
const legalSpan = async () => {
  "use cache";

  return (
    <span
      className="order-last block text-center text-muted-foreground text-sm md:order-first"
      suppressHydrationWarning
    >
      © {new Date().getFullYear()} Jasmyre, All rights reserved
    </span>
  );
};

export default function FooterSection({
  links = defaultLinks,
}: FooterSectionProps) {
  return (
    <footer className="border-b bg-white pt-20 dark:bg-transparent" id="footer">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 md:grid-cols-5">
          <div className="md:col-span-2">
            <Link
              aria-label="go home"
              className="size-fit cursor-pointer font-bold text-xl opacity-90 transition-all duration-200 hover:opacity-100"
              href="/"
              target=""
            >
              Quizlet
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 md:col-span-3">
            {links.map((link) => (
              <div className="space-y-4 text-sm" key={link.group}>
                <span className="block font-medium">{link.group}</span>
                {link.items.map((item) => (
                  <Link
                    aria-label={item.title}
                    className="block text-muted-foreground duration-150 hover:text-primary"
                    href={item.href}
                    key={item.title}
                    rel="noopener noreferrer"
                    target={item.target}
                  >
                    <span>{item.title}</span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-wrap items-end justify-between gap-6 border-t py-6">
          {legalSpan()}
          <div className="order-first flex flex-wrap justify-center gap-6 text-sm md:order-last">
            <Link
              aria-label="Facebook"
              className="block text-muted-foreground hover:text-primary"
              href="https://www.facebook.com/andrei.lanuza.25"
              rel="noopener noreferrer"
              target="_blank"
            >
              <svg
                aria-label="icon"
                className="size-6"
                height="1em"
                role="img"
                viewBox="0 0 24 24"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95"
                  fill="currentColor"
                />
              </svg>
            </Link>
            <Link
              aria-label="LinkedIn"
              className="block text-muted-foreground hover:text-primary"
              href="https://www.linkedin.com/in/jasmyre-andrei-lanuza-092a972a1/"
              rel="noopener noreferrer"
              target="_blank"
            >
              <svg
                aria-label="icon"
                className="size-6"
                height="1em"
                role="img"
                viewBox="0 0 24 24"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93zM6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37z"
                  fill="currentColor"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
