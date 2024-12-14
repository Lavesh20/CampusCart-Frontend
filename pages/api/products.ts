import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File } from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const form = new formidable.IncomingForm({
    uploadDir: './public/uploads',
    keepExtensions: true,
  });

  form.parse(
    req,
    async (
      err: any,
      fields: Partial<{
        productName: string | (string | undefined)[];
        brandName: string | (string | undefined)[];
        description: string | (string | undefined)[];
        price: unknown;
        quantity: unknown;
      }>,
      files: { image: any }
    ) => {
      if (err) {
        console.error('Error parsing form:', err);
        return res.status(500).json({ message: 'Error processing form data' });
      }

      try {
        interface ProductImage {
          filename: string;
          path: string;
        }

        const productDetails: {
          productName: string | undefined;
          brandName: string | undefined;
          description: string | undefined;
          price: number;
          quantity: number;
          images: ProductImage[];
        } = {
          productName: Array.isArray(fields.productName)
            ? fields.productName[0]
            : fields.productName,
          brandName: Array.isArray(fields.brandName)
            ? fields.brandName[0]
            : fields.brandName,
          description: Array.isArray(fields.description)
            ? fields.description[0]
            : fields.description,
          price: parseFloat(
            Array.isArray(fields.price)
              ? fields.price[0]
              : (fields.price as unknown as string)
          ),
          quantity: parseInt(
            Array.isArray(fields.quantity)
              ? fields.quantity[0]
              : (fields.quantity as unknown as string)
          ),
          images: [],
        };

        // Process uploaded images
        const imageFiles = files.image as File | File[];
        if (Array.isArray(imageFiles)) {
          productDetails.images = imageFiles.map((file) => ({
            filename: file.newFilename,
            path: file.filepath.replace('public', ''),
          }));
        } else if (imageFiles) {
          productDetails.images.push({
            filename: imageFiles.newFilename,
            path: imageFiles.filepath.replace('public', ''),
          });
        }

        // Simulate saving to the database
        console.log('Saving product:', productDetails);

        // Simulate a delay for database operation
        await new Promise((resolve) => setTimeout(resolve, 1000));

        res
          .status(200)
          .json({ message: 'Product added successfully', product: productDetails });
      } catch (error) {
        console.error('Error processing product:', error);
        res.status(500).json({ message: 'Error saving product' });
      }
    }
  );
}
