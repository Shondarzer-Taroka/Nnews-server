/*
  Warnings:

  - You are about to drop the column `newsId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `targetId` on the `Like` table. All the data in the column will be lost.
  - You are about to drop the column `targetType` on the `Like` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,opinionId]` on the table `Like` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userIp,opinionId]` on the table `Like` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `opinionId` to the `Like` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_newsId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_userId_fkey";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "newsId";

-- AlterTable
ALTER TABLE "Like" DROP COLUMN "targetId",
DROP COLUMN "targetType",
ADD COLUMN     "opinionId" TEXT NOT NULL,
ADD COLUMN     "userIp" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Like_userId_opinionId_key" ON "Like"("userId", "opinionId");

-- CreateIndex
CREATE UNIQUE INDEX "Like_userIp_opinionId_key" ON "Like"("userIp", "opinionId");

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_opinionId_fkey" FOREIGN KEY ("opinionId") REFERENCES "Opinion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
