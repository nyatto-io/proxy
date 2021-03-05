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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = __importStar(require("express"));
var dotenv_1 = require("dotenv");
var helpers_1 = require("./helpers");
require("express-async-errors");
var puppeteer_1 = __importDefault(require("puppeteer"));
var cookie_parser_1 = __importDefault(require("cookie-parser"));
var cors_1 = __importDefault(require("cors"));
var uuid_1 = require("uuid");
var fs_1 = __importDefault(require("fs"));
dotenv_1.config();
var app = express_1["default"]();
app.use(express_1.json());
app.use(cors_1["default"]({
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));
app.use(express_1.urlencoded({ extended: true }));
app.use(cookie_parser_1["default"]());
app.get('/storage/:path', function (req, res) {
    var path = "./storage/" + req.params.path;
    if (fs_1["default"].existsSync(path)) {
        var buffer = fs_1["default"].readFileSync(path);
        res.send(buffer);
        fs_1["default"].unlinkSync(path);
    }
    else {
        res.sendStatus(404);
    }
});
app.post('/manga/mangakakalot/chapters', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var url, browser, page, elements, indexes, urls;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                url = req.body.url;
                return [4 /*yield*/, puppeteer_1["default"].launch()];
            case 1:
                browser = _a.sent();
                return [4 /*yield*/, browser.newPage()];
            case 2:
                page = _a.sent();
                return [4 /*yield*/, page.goto(url)];
            case 3:
                _a.sent();
                return [4 /*yield*/, page.evaluate(function () {
                        var div = document.querySelector('body > div.container-chapter-reader');
                        if (!div) {
                            return [];
                        }
                        return Array.from(div.children).map(function (element) { return ({
                            tag: element.tagName
                        }); });
                    })];
            case 4:
                elements = _a.sent();
                indexes = [];
                elements.forEach(function (element, index) {
                    if (element.tag.toLowerCase() === 'img') {
                        indexes.push(index + 1);
                    }
                });
                urls = [];
                return [4 /*yield*/, Promise.all(indexes.map(function (index) { return __awaiter(void 0, void 0, void 0, function () {
                        var selector, image, filename, path, buffer;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    selector = "body > div.container-chapter-reader > img:nth-child(" + index + ")";
                                    return [4 /*yield*/, page.waitForSelector(selector)];
                                case 1:
                                    _a.sent();
                                    return [4 /*yield*/, page.$(selector)];
                                case 2:
                                    image = _a.sent();
                                    if (!image) return [3 /*break*/, 4];
                                    filename = uuid_1.v4() + ".png";
                                    path = "./storage/" + filename;
                                    return [4 /*yield*/, image.screenshot({ path: path })];
                                case 3:
                                    buffer = _a.sent();
                                    if (buffer) {
                                        urls.push(filename);
                                    }
                                    _a.label = 4;
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); }))];
            case 5:
                _a.sent();
                res.json(urls);
                return [2 /*return*/];
        }
    });
}); });
var port = process.env.APP_PORT || process.env.PORT;
app.listen(port, function () { return helpers_1.log("Server listening at port: " + port); });
