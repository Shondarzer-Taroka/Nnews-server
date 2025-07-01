-- CreateTable
CREATE TABLE "EPaper" (
    "id" SERIAL NOT NULL,
    "mainEpaperImage" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "EPaper_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "contentImage" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "bboxX" DOUBLE PRECISION NOT NULL,
    "bboxY" DOUBLE PRECISION NOT NULL,
    "bboxWidth" DOUBLE PRECISION NOT NULL,
    "bboxHeight" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "isLeading" BOOLEAN NOT NULL DEFAULT false,
    "pageNumber" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "epaperId" INTEGER NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EPaper_date_idx" ON "EPaper"("date");

-- CreateIndex
CREATE INDEX "EPaper_userId_idx" ON "EPaper"("userId");

-- CreateIndex
CREATE INDEX "Article_epaperId_idx" ON "Article"("epaperId");

-- CreateIndex
CREATE INDEX "Article_category_idx" ON "Article"("category");

-- CreateIndex
CREATE INDEX "Article_isLeading_idx" ON "Article"("isLeading");

-- AddForeignKey
ALTER TABLE "EPaper" ADD CONSTRAINT "EPaper_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_epaperId_fkey" FOREIGN KEY ("epaperId") REFERENCES "EPaper"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
