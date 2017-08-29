function svg2base64(id) {

    var svg = document.getElementById(id);
    var s = new XMLSerializer().serializeToString(svg);
    var encodedData = "data:image/svg+xml;base64," + window.btoa(s);
    
    return encodedData;
}

function svg2png(id) {

    var canvas = document.querySelector("canvas"),
    context = canvas.getContext("2d");

    var image = new Image;
    image.src = svg2base64(id);
    image.onload = function() {

        context.drawImage(image, 0, 0);

        var a = document.createElement("a");
        a.download = "fallback.png";
        a.href = canvas.toDataURL("image/png");
        a.click();
    }
}