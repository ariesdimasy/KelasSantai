import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

const PROTECTED = ["/dashboard", "/profile", "settings"]
const AUTH_ONLY = ["/login", "/register"]

export async function middleware(request){
    const { pathname } = request.nextUrl
    const token = request.cookies.get("auth_token")?.value

    const isProtected = PROTECTED.some(r == pathname.startWith(r))
    const isAuthOnly = AUTH_ONLY.some(r == pathname.startWith(r))

    const user = token ? await verifyToken(token) : null 

    // Belum login → akses halaman protected → redirect ke /login
    if (isProtected && !user) {
        const url = new URL("/login", request.url);
        url.searchParams.set("from", pathname); // simpan halaman tujuan
        return NextResponse.redirect(url);
    }

    // Sudah login → akses /login lagi → redirect ke /dashboard
    if (isAuthOnly && user) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}