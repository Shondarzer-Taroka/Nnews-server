/*
  Warnings:

  - You are about to drop the column `categories` on the `News` table. All the data in the column will be lost.
  - You are about to drop the column `subCategories` on the `News` table. All the data in the column will be lost.
  - Added the required column `category` to the `News` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subCategory` to the `News` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `News` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "News" DROP COLUMN "categories",
DROP COLUMN "subCategories",
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "keywords" TEXT[],
ADD COLUMN     "subCategory" TEXT NOT NULL,
ADD COLUMN     "subKeywords" TEXT[],
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
