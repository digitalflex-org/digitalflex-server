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
exports.BaseError = void 0;
var BaseError = /** @class */ (function (_super) {
    __extends(BaseError, _super);
    function BaseError(message, statusCode, isOperational) {
        if (statusCode === void 0) { statusCode = 500; }
        if (isOperational === void 0) { isOperational = true; }
        var _this = _super.call(this, message) || this;
        _this.statusCode = statusCode;
        _this.isOperational = isOperational;
        Error.captureStackTrace(_this);
        return _this;
    }
    return BaseError;
}(Error));
exports.BaseError = BaseError;
