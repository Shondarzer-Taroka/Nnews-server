/*
  Warnings:

  - A unique constraint covering the columns `[userId,newsId]` on the table `Like` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userIp,newsId]` on the table `Like` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_opinionId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_opinionId_fkey";

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "newsId" TEXT,
ALTER COLUMN "opinionId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Like" ADD COLUMN     "newsId" TEXT,
ALTER COLUMN "opinionId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Like_userId_newsId_key" ON "Like"("userId", "newsId");

-- CreateIndex
CREATE UNIQUE INDEX "Like_userIp_newsId_key" ON "Like"("userIp", "newsId");

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_opinionId_fkey" FOREIGN KEY ("opinionId") REFERENCES "Opinion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "News"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_opinionId_fkey" FOREIGN KEY ("opinionId") REFERENCES "Opinion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "News"("id") ON DELETE SET NULL ON UPDATE CASCADE;
