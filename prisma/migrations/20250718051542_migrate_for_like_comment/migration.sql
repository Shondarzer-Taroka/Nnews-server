/*
  Warnings:

  - You are about to drop the column `opinionId` on the `Like` table. All the data in the column will be lost.
  - You are about to drop the column `userIp` on the `Like` table. All the data in the column will be lost.
  - Added the required column `newsId` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetId` to the `Like` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetType` to the `Like` table without a default value. This is not possible if the table is not empty.
  - Made the column `userId` on table `Like` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_opinionId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_userId_fkey";

-- DropIndex
DROP INDEX "Like_userId_opinionId_key";

-- DropIndex
DROP INDEX "Like_userIp_opinionId_key";

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "newsId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Like" DROP COLUMN "opinionId",
DROP COLUMN "userIp",
ADD COLUMN     "targetId" TEXT NOT NULL,
ADD COLUMN     "targetType" TEXT NOT NULL,
ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "News"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
