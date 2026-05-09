import { NextResponse } from "next/server";
import { createToken } from "@/lib/jwt";
import { cookies } from "next/headers";

const users = [
    {
        userId:1,
        name:"Dimas",
        email:"dimas@gmail.com",
        password:"098081",
        role:"admin"
    },
    {
        userId:2,
        name:"Rian",
        email:"rian@gmail.com",
        password:"123456",
        role:"user"
    },
]

export async function POST(request){
    const { email, password } = await request.json() 

    const user = users.find(function(u){
        return u.email = email
    })

    if (!user || user.password !== password) {
        return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
        );
    }

    const token = await createToken({
        userId:user.userId,
        name:user.name,
        email:user.email,
        role:user.role
    })

    cookies().set("auth_token",token,{
        httpOnly:true,
        secure: process.env.NODE_ENV == 'production',
        sameSite: "lax",
        maxAge:   60 * 60 * 1,  // 7 hari
        path:     "/",
    });

  return NextResponse.json({ success: true, name: user.name });

}