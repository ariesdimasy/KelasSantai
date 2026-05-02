"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
export default function Navbar(){

    const pathname = usePathname()

    const navLinks = [
       
        { href:"/about" , label:"About"},
        { href:"/blog", label:"Blog" },
        { href:"/service", label:"Service"}
    ]

    return (<nav className="h-20 bg-blue-500 w-full">
        <div className="w-[80%] h-full mx-auto flex flex-col text-white justify-items-center">
            <span className="w-[100px] mr-10"> <Link href={'/'}>ADY</Link> </span>
            <div className="flex item-center gap-6">
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

            </div>
        </div> 
    </nav>)
}