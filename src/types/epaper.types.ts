// src/types/epaper.types.ts
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Article {
  id?: number;
  title: string;
  contentImage: string;
  content: string;
  bbox: BoundingBox;
  category: string;
  isLeading?: boolean;
  pageNumber?: number;
  epaperId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EpaperData {
  id?: number;
  mainEpaperImage: string;
  date: string;
  articles: Article[];
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EpaperResponse {
  id: number;
  mainEpaperImage: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  articles: Article[];
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface PaginatedEpaperResponse {
  data: EpaperResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}