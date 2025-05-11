"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceConflicts = exports.InternalServerError = exports.ForbiddenError = exports.UnauthorizedError = exports.BadRequest = exports.NotFoundError = void 0;
var BaseError_1 = require("./BaseError");
var NotFoundError = /** @class */ (function (_super) {
    __extends(NotFoundError, _super);
    function NotFoundError(message) {
        if (message === void 0) { message = 'Resource Not Found!'; }
        return _super.call(this, message, 404) || this;
    }
    return NotFoundError;
}(BaseError_1.BaseError));
exports.NotFoundError = NotFoundError;
var BadRequest = /** @class */ (function (_super) {
    __extends(BadRequest, _super);
    function BadRequest(message) {
        if (message === void 0) { message = 'Bad Request'; }
        return _super.call(this, message, 400) || this;
    }
    return BadRequest;
}(BaseError_1.BaseError));
exports.BadRequest = BadRequest;
var UnauthorizedError = /** @class */ (function (_super) {
    __extends(UnauthorizedError, _super);
    function UnauthorizedError(message) {
        if (message === void 0) { message = 'Unauthorized'; }
        return _super.call(this, message, 401) || this;
    }
    return UnauthorizedError;
}(BaseError_1.BaseError));
exports.UnauthorizedError = UnauthorizedError;
var ForbiddenError = /** @class */ (function (_super) {
    __extends(ForbiddenError, _super);
    function ForbiddenError(message) {
        if (message === void 0) { message = 'Forbidden'; }
        return _super.call(this, message, 403) || this;
    }
    return ForbiddenError;
}(BaseError_1.BaseError));
exports.ForbiddenError = ForbiddenError;
var InternalServerError = /** @class */ (function (_super) {
    __extends(InternalServerError, _super);
    function InternalServerError(message) {
        if (message === void 0) { message = 'Internal server error'; }
        return _super.call(this, message, 500) || this;
    }
    return InternalServerError;
}(BaseError_1.BaseError));
exports.InternalServerError = InternalServerError;
var ResourceConflicts = /** @class */ (function (_super) {
    __extends(ResourceConflicts, _super);
    function ResourceConflicts(message) {
        if (message === void 0) { message = 'Data with similar details already exists!'; }
        return _super.call(this, message, 409) || this;
    }
    return ResourceConflicts;
}(BaseError_1.BaseError));
exports.ResourceConflicts = ResourceConflicts;
