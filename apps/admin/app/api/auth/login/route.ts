import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/auth/auth";

export async function POST(req: Request) {

  try {

    const body = await req.json();

    const user = await prisma.user.findUnique({
      where: {
        email: body.email
      },
      include: {
        role: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { success:false, message:"Email tidak ditemukan" },
        { status:401 }
      );
    }

    const valid = await bcrypt.compare(
      body.password,
      user.password
    );

    if (!valid) {
      return NextResponse.json(
        { success:false, message:"Password salah" },
        { status:401 }
      );
    }

    const token = await createToken({
      id:user.id,
      email:user.email,
      role:user.role.name
    });

    const response = NextResponse.json({
      success:true,
      user:{
        id:user.id,
        name:user.name,
        email:user.email,
        role:user.role.name
      }
    });

    response.cookies.set("token",token,{
      httpOnly:true,
      sameSite:"lax",
      secure:false,
      path:"/",
      maxAge:60*60*24*7
    });

    return response;

  } catch(err) {

    return NextResponse.json(
      {
        success:false,
        message:String(err)
      },
      {
        status:500
      }
    );

  }

}
