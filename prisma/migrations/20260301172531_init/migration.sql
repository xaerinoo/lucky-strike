-- CreateTable
CREATE TABLE "Draw" (
    "id" SERIAL NOT NULL,
    "round" INTEGER NOT NULL,
    "drawDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Draw_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Store" (
    "id" SERIAL NOT NULL,
    "ltShpId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT NOT NULL,
    "region1" TEXT NOT NULL,
    "region2" TEXT,
    "region3" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WinHistory" (
    "id" SERIAL NOT NULL,
    "rank" INTEGER NOT NULL,
    "autoManual" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "drawId" INTEGER NOT NULL,
    "storeId" INTEGER NOT NULL,

    CONSTRAINT "WinHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Draw_round_key" ON "Draw"("round");

-- CreateIndex
CREATE UNIQUE INDEX "Store_ltShpId_key" ON "Store"("ltShpId");

-- CreateIndex
CREATE UNIQUE INDEX "WinHistory_drawId_storeId_rank_key" ON "WinHistory"("drawId", "storeId", "rank");

-- AddForeignKey
ALTER TABLE "WinHistory" ADD CONSTRAINT "WinHistory_drawId_fkey" FOREIGN KEY ("drawId") REFERENCES "Draw"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WinHistory" ADD CONSTRAINT "WinHistory_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
