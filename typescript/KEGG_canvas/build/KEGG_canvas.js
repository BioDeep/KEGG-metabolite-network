var convexHull;
(function (convexHull) {
    var convexHullTurns;
    (function (convexHullTurns) {
        convexHullTurns[convexHullTurns["left"] = 1] = "left";
        convexHullTurns[convexHullTurns["right"] = -1] = "right";
        convexHullTurns[convexHullTurns["none"] = 0] = "none";
    })(convexHullTurns || (convexHullTurns = {}));
    /**
     * 2D point
    */
    var Point = /** @class */ (function () {
        function Point(x, y) {
            this.x = x;
            this.y = y;
        }
        /**
         * Calculate the 2d distance to other point from this point.
        */
        Point.prototype.dist = function (p2) {
            var dx = p2.x - this.x;
            var dy = p2.y - this.y;
            return dx * dx + dy * dy;
        };
        /**
         * Is this point equals to a given point by numeric value equals
         * of the ``x`` and ``y``?
        */
        Point.prototype.Equals = function (p2) {
            return this.x == p2.x && this.y == p2.y;
        };
        Point.prototype.toString = function () {
            return "[" + this.x + ", " + this.y + "]";
        };
        return Point;
    }());
    var convexHullImpl;
    (function (convexHullImpl) {
        function JarvisMatch(points) {
            var hull = [];
            points.forEach(function (p) {
                if (hull.length === 0) {
                    hull.push(p);
                }
                else {
                    if (hull[0].x > p.x) {
                        hull[0] = p;
                    }
                    else if (hull[0].x == p.x) {
                        if (hull[0].y > p.y) {
                            hull[0] = p;
                        }
                    }
                }
            });
            var q = null;
            var counter = 0;
            while (counter < hull.length) {
                q = nextHullPoint(points, hull[counter]);
                if (!q.Equals(hull[0])) {
                    hull.push(q);
                }
                counter += 1;
            }
            return hull;
        }
        convexHullImpl.JarvisMatch = JarvisMatch;
        function nextHullPoint(points, p) {
            var q = p;
            var t = 0;
            points.forEach(function (r) {
                t = turn(p, q, r);
                if (t == convexHullTurns.right || t == convexHullTurns.none && p.dist(r) > p.dist(q)) {
                    q = r;
                }
            });
            return q;
        }
        function turn(p, q, r) {
            var a = (q.x - p.x) * (r.y - p.y) - (r.x - p.x) * (q.y - p.y);
            var b = 0;
            if (a == b) {
                return convexHullTurns.none;
            }
            else if (a < b) {
                return convexHullTurns.right;
            }
            else {
                return convexHullTurns.left;
            }
        }
    })(convexHullImpl || (convexHullImpl = {}));
})(convexHull || (convexHull = {}));
/**
 * Utils code that related to the html canvas node.
*/
var canvasUtils = /** @class */ (function () {
    function canvasUtils() {
    }
    /**
     * Serialize the svg node content to base64 string text value.
     *
     * @param id The ``svg`` node id attribute value.
    */
    canvasUtils.svg2base64 = function (id) {
        var svg = document.getElementById(id);
        var s = new XMLSerializer().serializeToString(svg);
        var encodedData = window.btoa(s);
        return "data:image/svg+xml;base64," + encodedData;
    };
    /**
     * Convert the svg image to png image and then do image file download.
     *
     * @param svgID The svg node ``id`` attribute value.
     * @param canvas_id The ``canvas`` node ``id`` attribute value.
     * @param fileName The file name for save the generated png image file.
    */
    canvasUtils.svg2png = function (svgID, canvas_id, fileName) {
        if (fileName === void 0) { fileName = "fallback.png"; }
        var canvas = document.querySelector(canvas_id);
        var context = canvas.getContext("2d");
        var image = new Image();
        image.src = canvasUtils.svg2base64(svgID);
        image.onload = function () {
            context.drawImage(image, 0, 0);
            var a = document.createElement("a");
            a.download = fileName;
            a.href = canvas.toDataURL("image/png");
            a.click();
        };
    };
    return canvasUtils;
}());
//# sourceMappingURL=KEGG_canvas.js.map