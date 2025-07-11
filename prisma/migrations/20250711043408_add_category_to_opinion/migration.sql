/*
  Warnings:

  - Added the required column `category` to the `Opinion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subCategory` to the `Opinion` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Opinion_authorId_idx";

-- AlterTable
ALTER TABLE "Opinion"
  ADD COLUMN "category" TEXT NOT NULL DEFAULT 'Uncategorized',
  ADD COLUMN "imageSource" TEXT NOT NULL DEFAULT 'Unknown',
  ADD COLUMN "imageTitle" TEXT NOT NULL DEFAULT 'Untitled',
  ADD COLUMN "keywords" TEXT[],
  ADD COLUMN "subCategory" TEXT NOT NULL DEFAULT 'General',
  ADD COLUMN "subKeywords" TEXT[];

