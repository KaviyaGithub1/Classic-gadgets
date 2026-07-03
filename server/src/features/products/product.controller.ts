import { Request, Response } from 'express';
import { prisma } from '../../config/db';
import cloudinary from '../../config/cloudinary';
import { Readable } from 'stream';
import { ProductStatus } from '@prisma/client';

const uploadToCloudinary = async (buffer: Buffer, mimeType: string = 'image/png'): Promise<string> => {
  const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME && 
                        process.env.CLOUDINARY_API_KEY && 
                        process.env.CLOUDINARY_API_SECRET;

  if (!hasCloudinary) {
    console.log("-------------------------------------------------------------------");
    console.log("[CLOUDINARY WARNING] Cloudinary credentials not configured in server/.env.");
    console.log("Falling back to local Base64 Data URI generation for testing...");
    console.log("-------------------------------------------------------------------");
    const base64Data = buffer.toString('base64');
    return `data:${mimeType};base64,${base64Data}`;
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'classic_gadgets/products' },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve(result.secure_url);
      }
    );
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search } = req.query;

    const queryOptions: any = {
      orderBy: { createdAt: 'desc' },
    };

    if (search && typeof search === 'string') {
      queryOptions.where = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { category: { contains: search, mode: 'insensitive' } },
          { brand: { contains: search, mode: 'insensitive' } },
        ]
      };
    }

    const products = await prisma.product.findMany(queryOptions);
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, category, brand, price, stock, discount, status } = req.body;
    
    // Validate numbers
    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock, 10);
    const parsedDiscount = discount ? parseFloat(discount) : 0;

    if (!name || !description || !category || !brand || isNaN(parsedPrice) || isNaN(parsedStock)) {
      res.status(400).json({ error: 'Required fields are missing or invalid' });
      return;
    }

    // Handle Image Uploads
    const images: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files as Express.Multer.File[]) {
        const url = await uploadToCloudinary(file.buffer, file.mimetype);
        images.push(url);
      }
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        category,
        brand,
        price: parsedPrice,
        stock: parsedStock,
        discount: parsedDiscount,
        status: (status as ProductStatus) || 'ACTIVE',
        images,
      }
    });

    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { name, description, category, brand, price, stock, discount, status, existingImages } = req.body;

    const parsedPrice = price ? parseFloat(price) : undefined;
    const parsedStock = stock ? parseInt(stock, 10) : undefined;
    const parsedDiscount = discount ? parseFloat(discount) : undefined;

    let images: string[] = [];
    
    if (existingImages) {
        try {
            images = JSON.parse(existingImages);
        } catch {
            if (typeof existingImages === 'string') images = [existingImages];
        }
    }

    // Append new uploaded images
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files as Express.Multer.File[]) {
        const url = await uploadToCloudinary(file.buffer, file.mimetype);
        images.push(url);
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(category && { category }),
        ...(brand && { brand }),
        ...(parsedPrice !== undefined && !isNaN(parsedPrice) && { price: parsedPrice }),
        ...(parsedStock !== undefined && !isNaN(parsedStock) && { stock: parsedStock }),
        ...(parsedDiscount !== undefined && !isNaN(parsedDiscount) && { discount: parsedDiscount }),
        ...(status && { status: status as ProductStatus }),
        ...(images.length > 0 && { images }),
      }
    });

    res.status(200).json({ message: 'Product updated successfully', product });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.product.delete({ where: { id } });
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
