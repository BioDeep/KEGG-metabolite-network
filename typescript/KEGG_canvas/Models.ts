namespace canvasModels {

    /**
     * 2D point
    */
    export class Point {

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

    export class Size {

        public width: number;
        public height: number;

        public toString(): string {
            return `[${this.width}, ${this.height}]`;
        }
    }
}