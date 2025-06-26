// src/controllers/e_paper.controller.ts
import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { uploadToS3 } from '../utils/s3Upload';
import { generatePdfThumbnail } from '../utils/pdfUtils';

const prisma = new PrismaClient();

export const uploadEPaper = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { title, description, date } = req.body;

    // Upload PDF to S3
    const pdfUrl = await uploadToS3(req.file, 'epapers');

    // Generate thumbnail
    const thumbnailBuffer = await generatePdfThumbnail(req.file.buffer);
    const thumbnailUrl = await uploadToS3(
      { buffer: thumbnailBuffer, originalname: 'thumbnail.jpg' },
      'epapers/thumbnails'
    );

    // Get page count
    const pageCount = await getPdfPageCount(req.file.buffer);

    // Create in database
    const ePaper = await prisma.ePaper.create({
      data: {
        title,
        description: description || null,
        pdfUrl,
        thumbnailUrl,
        date: new Date(date),
        pageCount,
        isPublished: true,
      },
    });

    res.status(201).json(ePaper);
  } catch (error) {
    console.error('Error uploading e-paper:', error);
    res.status(500).json({ error: 'Failed to upload e-paper' });
  }
};

export const getEPapers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [ePapers, total] = await Promise.all([
      prisma.ePaper.findMany({
        where: { isPublished: true },
        orderBy: { date: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.ePaper.count({ where: { isPublished: true } }),
    ]);

    res.json({
      data: ePapers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching e-papers:', error);
    res.status(500).json({ error: 'Failed to fetch e-papers' });
  }
};

export const getEPaperById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ePaper = await prisma.ePaper.findUnique({
      where: { id },
    });

    if (!ePaper) {
      return res.status(404).json({ error: 'E-paper not found' });
    }

    res.json(ePaper);
  } catch (error) {
    console.error('Error fetching e-paper:', error);
    res.status(500).json({ error: 'Failed to fetch e-paper' });
  }
};

// Utility function to get PDF page count
async function getPdfPageCount(pdfBuffer: Buffer): Promise<number> {
  const { PDFDocument } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  return pdfDoc.getPageCount();
}