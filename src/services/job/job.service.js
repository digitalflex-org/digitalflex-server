"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateJobSlug = void 0;
var redisConfig_1 = require("../../config/redisConfig");
var job_model_1 = require("../../models/job.model");
var errors_1 = require("../../utils/errors");
var BaseError_1 = require("../../utils/errors/BaseError");
var logger_1 = require("../../utils/logger");
var generateJobSlug = function (data) {
    var newstr = data.toLowerCase().split(' ').join('-');
    return newstr;
};
exports.generateJobSlug = generateJobSlug;
var JobService = /** @class */ (function () {
    function JobService() {
    }
    //get all jobs
    JobService.getJobs = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cachedJobs, jobs, total, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, redisConfig_1.redisClient.get('jobs')];
                    case 1:
                        cachedJobs = _a.sent();
                        if (cachedJobs) {
                            return [2 /*return*/, JSON.parse(cachedJobs)];
                        }
                        return [4 /*yield*/, job_model_1.default.find().exec()];
                    case 2:
                        jobs = _a.sent();
                        total = jobs.length;
                        return [4 /*yield*/, redisConfig_1.redisClient.set('jobs', JSON.stringify(jobs), 'EX', 60)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, jobs];
                    case 4:
                        error_1 = _a.sent();
                        if (error_1 instanceof BaseError_1.BaseError) {
                            logger_1.default.error('❌ Error fetching jobs:', error_1.message);
                        }
                        else {
                            logger_1.default.error('❌ Unknown error:', error_1);
                        }
                        throw error_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    //get job by id
    JobService.getJobById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var cachedJobs, parsedJobs, job_1, job, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, redisConfig_1.redisClient.get('jobs')];
                    case 1:
                        cachedJobs = _a.sent();
                        if (cachedJobs) {
                            parsedJobs = JSON.parse(cachedJobs);
                            job_1 = parsedJobs.find(function (item) { return item._id === id; });
                            if (job_1) {
                                return [2 /*return*/, job_1];
                            }
                        }
                        return [4 /*yield*/, job_model_1.default.findById(id)];
                    case 2:
                        job = _a.sent();
                        if (!job) {
                            throw new errors_1.NotFoundError('Job Not Found or exceed application deadline');
                        }
                        return [2 /*return*/, job];
                    case 3:
                        error_2 = _a.sent();
                        if (error_2 instanceof BaseError_1.BaseError) {
                            logger_1.default.error('❌ Error Fetching Job:', error_2.message);
                        }
                        else {
                            logger_1.default.error('❌ Unknown Error:', error_2);
                        }
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // get job by slug name
    JobService.getJobBySlug = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var job, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, job_model_1.default.findOne({ slug: data })];
                    case 1:
                        job = _a.sent();
                        if (!job) {
                            throw new errors_1.NotFoundError('No job with the given parameters found or probably deleted');
                        }
                        return [2 /*return*/, job];
                    case 2:
                        error_3 = _a.sent();
                        if (error_3 instanceof BaseError_1.BaseError) {
                            logger_1.default.error('Error Fetching Job', error_3.message);
                        }
                        else {
                            logger_1.default.error('❌ Unknown Error:', error_3);
                        }
                        throw error_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    //add job
    JobService.createJob = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var title, description, location_1, salary, deadline, slug, exisitingJob, job, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        title = data.title, description = data.description, location_1 = data.location, salary = data.salary, deadline = data.deadline, slug = data.slug;
                        return [4 /*yield*/, job_model_1.default.findOne({ title: title, location: location_1, slug: slug })];
                    case 1:
                        exisitingJob = _a.sent();
                        if (exisitingJob) {
                            throw new errors_1.ResourceConflicts('similar job details already exist!');
                        }
                        job = new job_model_1.default({
                            title: title,
                            description: description,
                            location: location_1,
                            salary: salary,
                            deadline: deadline,
                            slug: slug
                        }).save();
                        return [4 /*yield*/, redisConfig_1.redisClient.del('jobs')];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, job];
                    case 3:
                        error_4 = _a.sent();
                        if (error_4 instanceof BaseError_1.BaseError) {
                            logger_1.default.error('Error creating Job', error_4.message);
                        }
                        else {
                            logger_1.default.error('❌ Unknown Error:', error_4);
                        }
                        throw error_4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    JobService.updateJobDetails = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var job, updatedJob, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, job_model_1.default.findById(id)];
                    case 1:
                        job = _a.sent();
                        if (!job) {
                            throw new errors_1.NotFoundError('Selected Job not found probably deleted!');
                        }
                        job.title = data.title || job.title;
                        job.location = data.location || job.location;
                        job.salary = data.salary || job.salary;
                        job.deadline = data.deadline || job.deadline;
                        job.slug = data.slug || job.slug;
                        if (data.description) {
                            job.description = __assign(__assign({}, job.description), data.description);
                        }
                        return [4 /*yield*/, job.save()];
                    case 2:
                        updatedJob = _a.sent();
                        return [4 /*yield*/, redisConfig_1.redisClient.del('jobs')];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, updatedJob];
                    case 4:
                        error_5 = _a.sent();
                        if (error_5 instanceof BaseError_1.BaseError) {
                            logger_1.default.error('Error updating Job details', error_5.message, { isOperational: false });
                        }
                        else {
                            logger_1.default.error('Unknown Error', error_5);
                        }
                        throw error_5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    JobService.deleteJobs = function (identifiers) {
        return __awaiter(this, void 0, void 0, function () {
            var error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, job_model_1.default.deleteMany({ _id: { $in: identifiers } })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, redisConfig_1.redisClient.del('jobs')];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                    case 3:
                        error_6 = _a.sent();
                        if (error_6 instanceof BaseError_1.BaseError) {
                            logger_1.default.error('Error deleting selected jobs', error_6.message);
                        }
                        else {
                            logger_1.default.error('❌ Unknown Error:', error_6);
                        }
                        throw error_6;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return JobService;
}());
exports.default = JobService;
