export interface IEPaper {
  id: string;
  title: string;
  description: string | null;
  pdfUrl: string;
  thumbnailUrl: string;
  date: Date;
  pageCount: number;
  isPublished: boolean;
}

export interface IEPaperCreate {
  title: string;
  description?: string;
  pdfUrl: string;
  thumbnailUrl: string;
  date: Date;
  pageCount: number;
}