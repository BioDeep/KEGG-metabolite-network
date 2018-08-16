namespace convexHull {

    enum convexHullTurns {
        left = 1, right = -1, none = 0
    }

    /**
     * 2D point
    */
    class Point {

        public x: number;
        public y: number;

        constructor(x: number, y: number) {
            this.x = x;
            this.y = y;
        }

        /**
         * Calculate the 2d distance to other point from this point.
        */
        public dist(p2: Point): number {
            var dx: number = p2.x - this.x;
            var dy: number = p2.y - this.y;

            return dx * dx + dy * dy;
        }

        /**
         * Is this point equals to a given point by numeric value equals 
         * of the ``x`` and ``y``?
        */
        public Equals(p2: Point): boolean {
            return this.x == p2.x && this.y == p2.y;
        }

        public toString(): string {
            return `[${this.x}, ${this.y}]`;
        }
    }

    module convexHullImpl {

        export function JarvisMatch(points: Point[]): Point[] {
            var hull: Point[] = [];

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

            var q: Point = null;
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

        function nextHullPoint(points: Point[], p: Point): Point {
            var q: Point = p;
            var t: number = 0;

            points.forEach(r => {
                t = turn(p, q, r);

                if (t == convexHullTurns.right || t == convexHullTurns.none && p.dist(r) > p.dist(q)) {
                    q = r;
                }
            });

            return q;
        }

        function turn(p: Point, q: Point, r: Point): convexHullTurns {
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
}