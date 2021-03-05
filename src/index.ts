import express, { json, urlencoded } from 'express';
import { config } from 'dotenv';
import { log } from './helpers';
import 'express-async-errors';
import puppeter from 'puppeteer';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { v4 } from 'uuid';
import fs from 'fs';

config();

const app = express();

app.use(json());
app.use(
	cors({
		methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
	})
);
app.use(urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/storage/:path', (req, res) => {
	const path = `./storage/${req.params.path}`;

	if (fs.existsSync(path)) {
		const buffer = fs.readFileSync(path);
		res.send(buffer);
		fs.unlinkSync(path);
	} else {
		res.sendStatus(404);
	}
});

app.post('/manga/mangakakalot/chapters', async (req, res) => {
	const url = req.body.url;

	const browser = await puppeter.launch();

	const page = await browser.newPage();

	await page.goto(url);

	const elements = await page.evaluate(() => {
		const div = document.querySelector('body > div.container-chapter-reader');

		if (!div) {
			return [];
		}
		return Array.from(div.children).map((element) => ({
			tag: element.tagName,
		}));
	});

	const indexes: number[] = [];

	elements.forEach((element, index) => {
		if (element.tag.toLowerCase() === 'img') {
			indexes.push(index + 1);
		}
	});

	const urls: string[] = [];

	await Promise.all(
		indexes.map(async (index) => {
			const selector = `body > div.container-chapter-reader > img:nth-child(${index})`;
			await page.waitForSelector(selector);
			const image = await page.$(selector);

			if (image) {
				const filename = `${v4()}.png`;
				const path = `./storage/${filename}`;

				const buffer = await image.screenshot({ path });

				if (buffer) {
					urls.push(filename);
				}
			}
		})
	);

	res.json(urls);
});

const port = process.env.APP_PORT || 5000;

app.listen(port, () => log(`Server listening at port: ${port}`));
