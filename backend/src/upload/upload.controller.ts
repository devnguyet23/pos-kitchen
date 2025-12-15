import {
                    Controller,
                    Post,
                    UseInterceptors,
                    UploadedFile,
                    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('upload')
export class UploadController {
                    @Post('image')
                    @UseInterceptors(
                                        FileInterceptor('file', {
                                                            storage: diskStorage({
                                                                                destination: './uploads/products',
                                                                                filename: (req, file, callback) => {
                                                                                                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                                                                                                    const ext = extname(file.originalname);
                                                                                                    callback(null, `product-${uniqueSuffix}${ext}`);
                                                                                },
                                                            }),
                                                            fileFilter: (req, file, callback) => {
                                                                                if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
                                                                                                    return callback(new BadRequestException('Only image files are allowed!'), false);
                                                                                }
                                                                                callback(null, true);
                                                            },
                                                            limits: {
                                                                                fileSize: 5 * 1024 * 1024, // 5MB
                                                            },
                                        }),
                    )
                    uploadImage(@UploadedFile() file: Express.Multer.File) {
                                        if (!file) {
                                                            throw new BadRequestException('No file uploaded');
                                        }
                                        return {
                                                            url: `/uploads/products/${file.filename}`,
                                                            filename: file.filename,
                                        };
                    }
}
