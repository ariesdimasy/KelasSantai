import { NextResponse } from "next/server";

export async function middleware(){
    // there is no logic in here
    return NextResponse.next()
}