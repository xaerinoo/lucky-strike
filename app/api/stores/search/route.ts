import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const stores = await prisma.store.findMany({
      take: 20,
    });

    return NextResponse.json(stores);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "서버 에러 발생" },
      { status: 500 }
    );
  }
}