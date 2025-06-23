-- AlterTable
ALTER TABLE "News" ADD COLUMN     "imageSource" TEXT NOT NULL DEFAULT 'Unknown',
ADD COLUMN     "imageTitle" TEXT NOT NULL DEFAULT 'Untitled';
