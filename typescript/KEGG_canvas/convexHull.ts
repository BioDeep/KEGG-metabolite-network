/// <reference path="../build/svg.d.ts"/>

module convexHullImpl {

    enum convexHullTurns {
        left = 1, right = -1, none = 0
    }

    export function JarvisMatch(points: Canvas.Point[]): Canvas.Point[] {
        var hull: Canvas.Point[] = [];

        points.forEach(p => {
            if (hull.length === 0) {
                hull.push(p);
            } else {
                if (hull[0].x > p.x) {
                    hull[0] = p;
                } else if (hull[0].x == p.x) {
                    if (hull[0].y > p.y) {
                        hull[0] = p;
                    }
                }
            }
        });

        var q: Canvas.Point = null;
        var counter: number = 0;

        while (counter < hull.length) {
            q = nextHullPoint(points, hull[counter]);

            if (!q.Equals(hull[0])) {
                hull.push(q);
            }

            counter += 1;
        }

        return hull;
    }

    function nextHullPoint(points: Canvas.Point[], p: Canvas.Point): Canvas.Point {
        var q: Canvas.Point = p;
        var t: number = 0;

        points.forEach(r => {
            t = turn(p, q, r);

            if (t == convexHullTurns.right || t == convexHullTurns.none && p.dist(r) > p.dist(q)) {
                q = r;
            }
        });

        return q;
    }

    function turn(p: Canvas.Point, q: Canvas.Point, r: Canvas.Point): convexHullTurns {
        var a: number = (q.x - p.x) * (r.y - p.y) - (r.x - p.x) * (q.y - p.y);
        var b: number = 0;

        if (a == b) {
            return convexHullTurns.none;
        } else if (a < b) {
            return convexHullTurns.right;
        } else {
            return convexHullTurns.left;
        }
    }
}