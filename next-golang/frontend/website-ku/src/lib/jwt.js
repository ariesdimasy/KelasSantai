import { SignJWT, JwtVerify, jwtVerify } from "jose";

const secretKey = new TextEncoder().encode(process.env.SECRET_KEY)

export async function createToken(payload){
    return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS265"})
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secretKey)
}

export async function verifyToken(token){
    try { 
        const { payload } = await jwtVerify(token, secretKey)
        return payload
    } catch(err){
        return null
    }
}