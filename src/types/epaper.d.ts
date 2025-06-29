// types/epaper.d.ts
interface EPaper {
  id: string;
  title: string;
  description?: string;
  pdfUrl: string;
  thumbnailUrl: string;
  date: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}