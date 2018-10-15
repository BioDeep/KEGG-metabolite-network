declare namespace convexHull {
}
/**
 * Utils code that related to the html canvas node.
*/
declare class canvasUtils {
    /**
     * Serialize the svg node content to base64 string text value.
     *
     * @param id The ``svg`` node id attribute value.
    */
    static svg2base64(id: string): string;
    /**
     * Convert the svg image to png image and then do image file download.
     *
     * @param svgID The svg node ``id`` attribute value.
     * @param canvas_id The ``canvas`` node ``id`` attribute value.
     * @param fileName The file name for save the generated png image file.
    */
    static svg2png(svgID: string, canvas_id: string, fileName?: string): void;
}
