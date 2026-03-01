import { NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

interface Store {
  id: number;
  name: string | null;
  latitude: number;
  longitude: number;
  total_count: bigint;
  first_count: bigint;
  second_count: bigint;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const region1 = searchParams.get("region1");  // 시
  const region2 = searchParams.get("region2");  // 구
  const minCount = Number(searchParams.get("minCount") || 0); // 최소 회차
  const rank = Number(searchParams.get("rank") || 1);   // 1 = 1등이상, 2 = 2등이상
  const sort = searchParams.get("sort");

  try {
    // 1등/2등이상 필터링 조건
    const rankFilter = rank === 1
      ? Prisma.sql`COUNT(CASE WHEN w.rank = 1 THEN 1 END) >= ${minCount}`
      : Prisma.sql`COUNT(CASE WHEN w.rank <= 2 THEN 1 END) >= ${minCount}`;

    // 쿼리 실행
    const stores = await prisma.$queryRaw<Store[]>`
      SELECT
        s.id,
        s.name,
        s.latitude,
        s.longitude,
        COUNT(w.id) AS total_count,
        COUNT(CASE WHEN w.rank = 1 THEN 1 END) AS first_count,
        COUNT(CASE WHEN w.rank = 2 THEN 1 END) AS second_count
      FROM "Store" s
      LEFT JOIN "WinHistory" w ON s.id = w."storeId" /* Store에 WinHistory가 없는 경우에도 결과에 포함시키기 위해 LEFT JOIN 사용 */
      WHERE 1=1
        ${region1 ? Prisma.sql`AND s.region1 = ${region1}` : Prisma.sql``}
        ${region2 ? Prisma.sql`AND s.region2 = ${region2}` : Prisma.sql``}
      GROUP BY s.id
      HAVING ${rankFilter}
      ORDER BY ${Prisma.raw(sort === "total" ? "total_count DESC" : "first_count DESC")}
      LIMIT 100;
    `;

    // BigInt => Number 직렬화
    const serialized = stores.map(store => ({
      ...store,
      total_count: Number(store.total_count),
      first_count: Number(store.first_count),
      second_count: Number(store.second_count),
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}