"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const dotenv_1 = require("dotenv");
const helpers_1 = require("./helpers");
require("express-async-errors");
const puppeteer_1 = __importDefault(require("puppeteer"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const uuid_1 = require("uuid");
const fs_1 = __importDefault(require("fs"));
dotenv_1.config();
const app = express_1.default();
app.use(express_1.json());
app.use(cors_1.default({
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));
app.use(express_1.urlencoded({ extended: true }));
app.use(cookie_parser_1.default());
app.get('/storage/:path', (req, res) => {
    const path = `./storage/${req.params.path}`;
    if (fs_1.default.existsSync(path)) {
        const buffer = fs_1.default.readFileSync(path);
        res.send(buffer);
        fs_1.default.unlinkSync(path);
    }
    else {
        res.sendStatus(404);
    }
});
app.post('/manga/mangakakalot/chapters', async (req, res) => {
    const url = req.body.url;
    const browser = await puppeteer_1.default.launch();
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
    const indexes = [];
    elements.forEach((element, index) => {
        if (element.tag.toLowerCase() === 'img') {
            indexes.push(index + 1);
        }
    });
    const urls = [];
    await Promise.all(indexes.map(async (index) => {
        const selector = `body > div.container-chapter-reader > img:nth-child(${index})`;
        await page.waitForSelector(selector);
        const image = await page.$(selector);
        if (image) {
            const filename = `${uuid_1.v4()}.png`;
            const path = `./storage/${filename}`;
            const buffer = await image.screenshot({ path });
            if (buffer) {
                urls.push(filename);
            }
        }
    }));
    res.json(urls);
});
const port = process.env.APP_PORT || 5000;
app.listen(port, () => helpers_1.log(`Server listening at port: ${port}`));
