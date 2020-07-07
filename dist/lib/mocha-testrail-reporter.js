"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var mocha_1 = require("mocha");
var testrail_1 = require("./testrail");
var shared_1 = require("./shared");
var testrail_interface_1 = require("./testrail.interface");
var MochaTestRailReporter = /** @class */ (function (_super) {
    __extends(MochaTestRailReporter, _super);
    function MochaTestRailReporter(runner) {
        var _this = _super.call(this, runner) || this;
        _this.results = [];
        var reporterOptions = {
            domain: process.env.TESTRAILS_HOST,
            username: process.env.TESTRAILS_USERNAME,
            password: process.env.TESTRAILS_PASSWORD,
            projectId: process.env.TESTRAILS_PROJECTID,
            suiteName: process.env.TESTRAILS_UNIT_SUITENAME
        };
        _this.validate(reporterOptions, 'domain');
        _this.validate(reporterOptions, 'username');
        _this.validate(reporterOptions, 'password');
        _this.validate(reporterOptions, 'projectId');
        _this.validate(reporterOptions, 'suiteName');
        runner.on('start', function () { });
        runner.on('suite', function (suite) { });
        runner.on('suite end', function () { });
        runner.on('pending', function (test) { });
        runner.on('pass', function (test) {
            var _a, _b;
            var caseIds = shared_1.titleToCaseIds(test.title);
            if (caseIds.length > 0) {
                if (test.speed === 'fast') {
                    var results = caseIds.map(function (caseId) {
                        return {
                            case_id: caseId,
                            status_id: testrail_interface_1.Status.Passed,
                            comment: "Took (" + test.duration + "ms)"
                        };
                    });
                    (_a = _this.results).push.apply(_a, results);
                }
                else {
                    var results = caseIds.map(function (caseId) {
                        return {
                            case_id: caseId,
                            status_id: testrail_interface_1.Status.Passed,
                            comment: "Took (" + test.duration + "ms)"
                        };
                    });
                    (_b = _this.results).push.apply(_b, results);
                }
            }
        });
        runner.on('fail', function (test) {
            var _a;
            var caseIds = shared_1.titleToCaseIds(test.title);
            if (caseIds.length > 0) {
                var results = caseIds.map(function (caseId) {
                    return {
                        case_id: caseId,
                        status_id: testrail_interface_1.Status.Failed,
                        comment: test.err + ", took (" + test.duration + "ms)"
                    };
                });
                (_a = _this.results).push.apply(_a, results);
            }
        });
        runner.on('end', function () {
            if (_this.results.length == 0) {
                console.warn("No testcases were matched. Ensure that your tests are declared correctly and matches TCxxx");
            }
            new testrail_1.TestRail(reporterOptions).publish(_this.results, function () {
                console.log('Finished');
            });
        });
        return _this;
    }
    MochaTestRailReporter.prototype.validate = function (options, name) {
        if (options == null)
            throw new Error("Missing --reporter-options in mocha.opts");
        if (options[name] == null)
            throw new Error("Missing " + name + " value. Please update --reporter-options in mocha.opts");
    };
    return MochaTestRailReporter;
}(mocha_1.reporters.Spec));
exports.MochaTestRailReporter = MochaTestRailReporter;
//# sourceMappingURL=mocha-testrail-reporter.js.map