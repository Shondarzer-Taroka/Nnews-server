/*
  Warnings:

  - You are about to drop the column `isAdmin` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `isRead` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `relatedId` on the `Notification` table. All the data in the column will be lost.
  - Changed the type of `type` on the `Notification` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "OpinionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('OPINION_SUBMITTED', 'OPINION_APPROVED', 'OPINION_REJECTED', 'SYSTEM_MESSAGE');

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "isAdmin",
DROP COLUMN "isRead",
DROP COLUMN "relatedId",
ADD COLUMN     "opinionId" TEXT,
ADD COLUMN     "read" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "type",
ADD COLUMN     "type" "NotificationType" NOT NULL;

-- AlterTable
ALTER TABLE "Opinion" ADD COLUMN     "status" "OpinionStatus" NOT NULL DEFAULT 'PENDING';

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_opinionId_fkey" FOREIGN KEY ("opinionId") REFERENCES "Opinion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
