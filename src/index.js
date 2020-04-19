"use strict";
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
exports.__esModule = true;
var axios_1 = require("axios");
var Debug = require("debug");
var discovery_1 = require("./discovery");
var debug = Debug('index');
var Axios = axios_1["default"].create();
var Tablo = /** @class */ (function () {
    function Tablo() {
    }
    /**
     * Utilizes HTTP discovery with UDP broadcast fallback to find local Tablo devices
     */
    Tablo.prototype.discover = function () {
        return __awaiter(this, void 0, void 0, function () {
            var discoverData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, discovery_1.discovery.http()];
                    case 1:
                        discoverData = _a.sent();
                        debug('discover.http:');
                        debug(discoverData);
                        if (!(Object.keys(discoverData).length === 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, discovery_1.discovery.broadcast()];
                    case 2:
                        discoverData = _a.sent();
                        debug('discover.broadcast:');
                        debug(discoverData);
                        _a.label = 3;
                    case 3:
                        if (Object.keys(discoverData).length === 0) {
                            return [2 /*return*/, []];
                        }
                        // TODO: a nicety when testing, should probably remove
                        this.devices = discoverData;
                        this.device = this.devices[0];
                        return [2 /*return*/, discoverData];
                }
            });
        });
    };
    /**
     * Pre-flight check
     * @throws Error when no device has been selected
     */
    Tablo.prototype.isReady = function () {
        if (typeof this.device === 'undefined' || !this.device || !this.device.private_ip) {
            var msg = 'TabloAPI - No device selected.';
            throw new Error(msg);
        }
    };
    /**
     * Returns server info reported by the Tablo
     */
    Tablo.prototype.getServerInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            var info, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.isReady();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.get('/server/info')];
                    case 2:
                        info = _a.sent();
                        return [2 /*return*/, info];
                    case 3:
                        err_1 = _a.sent();
                        throw err_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     *  Returns a count of the Recordings on the Tablo
     * @param force whether or not to force reloading from the device or use cached airings
     */
    Tablo.prototype.getRecordingsCount = function (force) {
        if (force === void 0) { force = false; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, err_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.isReady();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        if (!(!this.airingsCache || force)) return [3 /*break*/, 3];
                        _a = this;
                        return [4 /*yield*/, this.get('/recordings/airings')];
                    case 2:
                        _a.airingsCache = _b.sent();
                        _b.label = 3;
                    case 3:
                        if (!this.airingsCache) {
                            return [2 /*return*/, 0];
                        }
                        return [2 /*return*/, this.airingsCache.length];
                    case 4:
                        err_2 = _b.sent();
                        throw err_2;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Retrieves all Recordings from the Tablo
     * @param force whether or not to force reloading from the device or use cached airings
     * @param progressCallback function to receive a count of records processed
     */
    Tablo.prototype.getRecordings = function (force, progressCallback) {
        if (force === void 0) { force = false; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.isReady();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        if (!(!this.airingsCache || force)) return [3 /*break*/, 3];
                        _a = this;
                        return [4 /*yield*/, this.get('/recordings/airings')];
                    case 2:
                        _a.airingsCache = _b.sent();
                        _b.label = 3;
                    case 3:
                        if (!this.airingsCache) {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, this.batch(this.airingsCache, progressCallback)];
                    case 4:
                        error_1 = _b.sent();
                        throw error_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Deletes a
     * @param path
     */
    Tablo.prototype["delete"] = function (path) {
        return __awaiter(this, void 0, void 0, function () {
            var url;
            return __generator(this, function (_a) {
                this.isReady();
                url = this.getUrl(path);
                return [2 /*return*/, Axios["delete"](url)];
            });
        });
    };
    /**
     * Try to receive data from a specified path
     * @param path
     */
    Tablo.prototype.get = function (path) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.isReady();
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var url, response, error_2;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    url = this.getUrl(path);
                                    return [4 /*yield*/, Axios.get(url)];
                                case 1:
                                    response = _a.sent();
                                    resolve(response.data);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_2 = _a.sent();
                                    reject(error_2);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    Tablo.prototype.getUrl = function (path) {
        var newPath = path.replace(/^\/+/, '');
        return "http://" + this.device.private_ip + ":8885/" + newPath;
    };
    Tablo.prototype.batch = function (data, progressCallback) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.isReady();
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var chunk, idx, size, recs, _loop_1, this_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    chunk = [];
                                    idx = 0;
                                    size = 50;
                                    recs = [];
                                    _loop_1 = function () {
                                        var returned, err_3, values;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    chunk = data.slice(idx, size + idx);
                                                    idx += size;
                                                    _a.label = 1;
                                                case 1:
                                                    _a.trys.push([1, 3, , 4]);
                                                    return [4 /*yield*/, this_1.post('batch', chunk)];
                                                case 2:
                                                    returned = _a.sent();
                                                    return [3 /*break*/, 4];
                                                case 3:
                                                    err_3 = _a.sent();
                                                    reject(err_3);
                                                    return [3 /*break*/, 4];
                                                case 4:
                                                    values = Object.keys(returned).map(function (el) {
                                                        return returned[el];
                                                    });
                                                    recs = recs.concat(values);
                                                    if (typeof progressCallback === 'function') {
                                                        progressCallback(recs.length);
                                                    }
                                                    return [2 /*return*/];
                                            }
                                        });
                                    };
                                    this_1 = this;
                                    _a.label = 1;
                                case 1:
                                    if (!(idx < data.length)) return [3 /*break*/, 3];
                                    return [5 /*yield**/, _loop_1()];
                                case 2:
                                    _a.sent();
                                    return [3 /*break*/, 1];
                                case 3:
                                    resolve(recs);
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    Tablo.prototype.post = function (path, strArray) {
        if (path === void 0) { path = 'batch'; }
        return __awaiter(this, void 0, void 0, function () {
            var toPost;
            var _this = this;
            return __generator(this, function (_a) {
                this.isReady();
                toPost = strArray ? strArray : null;
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var url, returned, data, error_3;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    url = this.getUrl(path);
                                    return [4 /*yield*/, Axios.post(url, toPost)];
                                case 1:
                                    returned = _a.sent();
                                    data = returned.data;
                                    resolve(data);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_3 = _a.sent();
                                    reject(error_3);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    return Tablo;
}());
exports.Tablo = Tablo;
exports["default"] = Tablo;
