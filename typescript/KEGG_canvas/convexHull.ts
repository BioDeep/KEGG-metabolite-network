/// <reference path="../build/svg.d.ts"/>

namespace ConvexHull {

    enum HullTurns {
        left = 1, right = -1, none = 0
    }

    export module impl {

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

                if (t == HullTurns.right || t == HullTurns.none && p.dist(r) > p.dist(q)) {
                    q = r;
                }
            });

            return q;
        }

        function turn(p: Canvas.Point, q: Canvas.Point, r: Canvas.Point): HullTurns {
            var a: number = (q.x - p.x) * (r.y - p.y) - (r.x - p.x) * (q.y - p.y);
            var b: number = 0;

            if (a == b) {
                return HullTurns.none;
            } else if (a < b) {
                return HullTurns.right;
            } else {
                return HullTurns.left;
            }
        }
    }

    export class Polygon {
        public group: string;
        public points: TagPoint[];

        public toString(): string {
            return this.group;
        }
    }

    export class TagPoint extends Canvas.Point {
        public group: string;

        public toString(): string {
            return group;
        }
    }
}