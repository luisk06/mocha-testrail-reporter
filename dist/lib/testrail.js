"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var request = require("unirest");
/**
 * TestRail basic API wrapper
 */
var TestRail = /** @class */ (function () {
    function TestRail(options) {
        this.options = options;
        // compute base url
        this.base = options.domain + "/index.php";
    }
    TestRail.prototype._post = function (api, body, callback, error) {
        var req = request("POST", this.base)
            .query("/api/v2/" + api)
            .headers({
            "content-type": "application/json"
        })
            .type("json")
            .send(body)
            .auth(this.options.username, this.options.password)
            .end(function (res) {
            if (res.error) {
                console.log("Error: %s", JSON.stringify(res.body));
                if (error) {
                    error(res.error);
                }
                else {
                    throw new Error(res.error);
                }
            }
            callback(res.body);
        });
    };
    TestRail.prototype._get = function (api, callback, error) {
        var req = request("GET", this.base)
            .query("/api/v2/" + api)
            .headers({
            "content-type": "application/json"
        })
            .type("json")
            .auth(this.options.username, this.options.password)
            .end(function (res) {
            if (res.error) {
                console.log("Error: %s", JSON.stringify(res.body));
                if (error) {
                    error(res.error);
                }
                else {
                    throw new Error(res.error);
                }
            }
            callback(res.body);
        });
    };
    /**
     * Fetchs test cases from projet/suite based on filtering criteria (optional)
     * @param {{[p: string]: number[]}} filters
     * @param {Function} callback
     */
    TestRail.prototype.fetchCases = function (suiteId, filters, callback) {
        var filter = "";
        if (filters) {
            for (var key in filters) {
                if (filters.hasOwnProperty(key)) {
                    filter += "&" + key + "=" + filters[key].join(",");
                }
            }
        }
        this._get("get_cases/" + this.options.projectId + "&suite_id=" + suiteId + filter, function (body) {
            if (callback) {
                callback(body);
            }
        });
    };
    /**
     * Publishes results of execution of an automated test run
     * @param {string} name
     * @param {string} description
     * @param {TestRailResult[]} results
     * @param {Function} callback
     */
    TestRail.prototype.publish = function (results, callback) {
        var _this = this;
        console.log("Publishing " + results.length + " test result(s) to " + this.base);
        this._get("get_plans/" + this.options.projectId + "&is_completed=0", function (plans) {
            if (plans.error)
                throw new Error(plans.error);
            _this._get("get_plan/" + plans[0].id + "&is_completed=0", function (plan) {
                if (plan.error)
                    throw new Error(plan.error);
                var run = plan.entries
                    .filter(function (e) { return e.name.includes(_this.options.suiteName); })
                    .reduce(function (obj, e) {
                    return e.runs.filter(function (r) {
                        if (r.name.includes(_this.options.suiteName)) {
                            obj = r;
                            return obj;
                        }
                    });
                }, {});
                _this._post("add_results_for_cases/" + run[0].id, {
                    results: results
                }, function (body) {
                    // execute callback if specified
                    console.log('Cases published:', results);
                    if (callback) {
                        callback();
                    }
                });
            });
        });
    };
    return TestRail;
}());
exports.TestRail = TestRail;
//# sourceMappingURL=testrail.js.map