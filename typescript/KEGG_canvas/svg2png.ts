/**
 * Utils code that related to the html canvas node.
*/
class canvasUtils {

    /**
     * Serialize the svg node content to base64 string text value.
     * 
     * @param id The ``svg`` node id attribute value. 
    */
    public static svg2base64(id: string): string {
        var svg: HTMLElement = document.getElementById(id);
        var s: string = new XMLSerializer().serializeToString(svg);
        var encodedData: string = window.btoa(s);

        return `data:image/svg+xml;base64,${encodedData}`;
    }

    /**
     * Convert the svg image to png image and then do image file download.
     * 
     * @param svgID The svg node ``id`` attribute value.
     * @param canvas_id The ``canvas`` node ``id`` attribute value.
     * @param fileName The file name for save the generated png image file.
    */
    public static svg2png(svgID: string, canvas_id: string, fileName: string = "fallback.png"): void {
        var canvas: HTMLCanvasElement = document.querySelector(canvas_id);
        var context = canvas.getContext("2d");
        var image = new Image();

        image.src = canvasUtils.svg2base64(svgID);
        image.onload = () => {
            context.drawImage(image, 0, 0);

            var a = document.createElement("a");
            a.download = fileName;
            a.href = canvas.toDataURL("image/png");
            a.click();
        }
    }
}