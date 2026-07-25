"use client"

import Link from "next/link"
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/",        label: "Home"    },
  { href: "/about",   label: "About" },
  { href: "/blogs",    label: "Blogs"    },
  { href: "/contact", label: "Contact"  },
  { href: "/products", label: "Products"  },
   { href: "/users", label: "Users"  },
];

export default function Navbar(){

    const pathname = usePathname();  // "/", "/about", "/blog", dll

    return <nav className="flex items-center gap-6 p-5">
      {navLinks.map(({ href, label }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`text-sm font-medium transition-colors duration-200
              ${isActive
                ? "text-purple-600 border-b-2 border-purple-600 pb-0.5"  // aktif!
                : "text-gray-600 hover:text-gray-900"                     // normal
              }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
}