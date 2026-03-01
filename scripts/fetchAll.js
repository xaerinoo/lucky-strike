/**
 * 동행복권 API 수집 스크립트
 */

import axios from "axios";
import pkg from "@prisma/client";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function fetchRound(round) {
  const url = `https://www.dhlottery.co.kr/wnprchsplcsrch/selectLtWnShp.do?srchWnShpRnk=all&srchLtEpsd=${round}`;

  const { data } = await axios.get(url);
  const list = data.data.list;

  if (!data?.data?.list) {
    console.warn(`${round}회: 데이터 없음`);
    return;
  }

  if (list.length === 0) {
    console.log(`${round}회: 당첨 판매점 없음`);
    return;
  }

  console.log(`${round}회: ${list.length}개`);

  const draw = await prisma.draw.upsert({
    where: { round },
    update: {},
    create: { round },
  });

  for (const item of list) {
    const store = await prisma.store.upsert({
      where: { ltShpId: item.ltShpId },
      update: {},
      create: {
        ltShpId: item.ltShpId,
        name: item.shpNm,
        phone: item.shpTelno,
        address: item.shpAddr,
        region1: item.tm1ShpLctnAddr,
        region2: item.tm2ShpLctnAddr,
        region3: item.tm3ShpLctnAddr,
        latitude: item.shpLat,
        longitude: item.shpLot,
      },
    });

    await prisma.winHistory.upsert({
      where: {
        drawId_storeId_rank: {
          drawId: draw.id,
          storeId: store.id,
          rank: item.wnShpRnk,
        },
      },
      update: {},
      create: {
        rank: item.wnShpRnk,
        autoManual: item.atmtPsvYnTxt,
        drawId: draw.id,
        storeId: store.id,
      },
    });
  }
}

async function main() {
  const start = 1;
  const end = 1213; // 나중에 최신회차로 수정..?

  for (let i = start; i <= end; i++) {
    try {
      await fetchRound(i);
    } catch (err) {
      console.error(`${i}회 실패`, err.message);
    }
  }
}

main().finally(() => prisma.$disconnect());