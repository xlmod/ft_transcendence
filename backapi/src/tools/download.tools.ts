import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import * as https from 'https';

export const MFileOptions = {
	// limits: {
	// 	fieldSize: Math.pow(1024, 2) // 1MB
	// },
	fileFilter: (req, file, cb) => {
		console.log('test');
		if (file.mimetype.match(/\/(jpeg|jpg|png|gif)$/)) {
			cb(null, true);
		} else {
			cb(new BadRequestException(`File type not supported ${extname(file.originalname)}`), false);
		}
	},
	storage: diskStorage({
		destination: (req, file, cb) => {
			console.log('test');
			const updest = './avatars';
			if (!fs.existsSync(updest)) {
				fs.mkdirSync(updest);
			}
			cb(null, updest)
		},
		filename: (req, file, cb) => {
			console.log('test');
			const filename = req.res.locals.uuid;
			const ext: string[] = ['.gif', '.png', '.jpg', '.jpeg'];
			for (const curr of ext) {
				if (fs.existsSync(process.env.STORAGE + filename + curr))
					fs.unlinkSync(process.env.STORAGE + filename + curr);
			}
			const extension = extname(file.originalname);
			cb(null, `${filename}${extension}`);
		}
	}),
}

export const download = async (url: string, filename: string) => {
	const updest = process.env.STORAGE;
	const ext: string[] = ['.gif', '.png', '.jpg', '.jpeg'];
	if (!fs.existsSync(updest))
		fs.mkdirSync(updest);
	for (const curr of ext) {
		if (fs.existsSync(updest + filename + curr))
			fs.unlinkSync(updest + filename + curr);
	}
	const file = fs.createWriteStream(updest + filename + url.substring(url.lastIndexOf('.')));
	https.get(url, function(response) {
		response.pipe(file);
	});
	return file;
}
