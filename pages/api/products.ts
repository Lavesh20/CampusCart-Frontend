import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File, Fields, Files } from 'formidable';

export const config = {
  api: {
    bodyParser: false, // Disable Next.js' built-in body parser
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
    uploadDir: './public/uploads', // Directory to store uploaded files
    keepExtensions: true, // Keep file extensions
  });

  form.parse(
    req,
    async (
      err: any,
      fields: Fields, // Use `Fields` from `formidable`
      files: Files // Use `Files` from `formidable`
    ) => {
      if (err) {
        console.error('Error parsing form:', err);
        return res.status(500).json({ message: 'Error processing form data' });
      }

      try {
        // Type for images
        interface ProductImage {
          filename: string;
          path: string;
        }

        // Build the product details object
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
            : (fields.productName as string | undefined),
          brandName: Array.isArray(fields.brandName)
            ? fields.brandName[0]
            : (fields.brandName as string | undefined),
          description: Array.isArray(fields.description)
            ? fields.description[0]
            : (fields.description as string | undefined),
          price: parseFloat(
            Array.isArray(fields.price)
              ? fields.price[0]
              : (fields.price as string)
          ),
          quantity: parseInt(
            Array.isArray(fields.quantity)
              ? fields.quantity[0]
              : (fields.quantity as string)
          ),
          images: [],
        };

        // Handle image files
        const imageFiles = files.image as File | File[] | undefined;
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
