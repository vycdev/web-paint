let rgbaColor = "rgba(0,0,0,1)"; ///Selected rgba color in string format
let brushSize = "10"; /// brush size in string format
let brushType = "brush"; /// brush type (brush.eraser.bucket,colorPick)
let rgbaArr = [0, 0, 0, 1]; //// current selected rgba color in array format
let isDone = true;

let brushSizeInput = document.getElementById("brushSizeInput");
let brushElement = document.getElementById("brush");
let rangeInput = document.getElementById("rangeInput");
let numberInput = document.getElementById("numberInput");
let uploadImg = document.getElementById("uploadImg");
let uploadBox = document.getElementById("uploadImage");
let closeUploadButton = document.getElementById("closeUploadBox");
let fileInput = document.getElementById("fileInput");
let submitButton = document.getElementById("submitImage");
let downloadButton = document.getElementById("downloadImg");
let navBar = document.getElementById("navBar");
let canvas = document.getElementById("canvas");
let bucket = document.getElementById("bucket");
let eraser = document.getElementById("eraser");
let reset = document.getElementById("canvasReset");
let pickColor = document.getElementById("pickColor");
let rainbow = document.getElementById("rainbowCheckbox");
let valueSpeedBox = document.getElementById("valueSpeedBox");

let mousePressed = false;
let lastX, lastY;
let ctx = canvas.getContext("2d");

let sizes = {
    width: 1920,
    height: 1080,
};

let initialSizes = {
    width: canvas.getBoundingClientRect().width,
    height: canvas.getBoundingClientRect().height,
};

window.onresize = () => {
    initialSizes = {
        width: canvas.getBoundingClientRect().width,
        height: canvas.getBoundingClientRect().height,
    };

    ctx.scale(
        sizes.width / initialSizes.width,
        sizes.height / initialSizes.height
    );

    drawCanvas();
};

function drawCanvas() {
    canvas.width = sizes.width;
    canvas.height = sizes.height;
    ctx.scale(
        sizes.width / initialSizes.width,
        sizes.height / initialSizes.height
    );

    ctx.fillStyle = "rgba(255,255,255,1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

drawCanvas();
init();

///Reset canvas button
reset.onclick = () => {
    drawCanvas();
};

// Download and Upload
function convertImageToCanvas(image) {
    let canvas = document.getElementById("canvas");
    let ctx = canvas.getContext("2d");
    let reader = new FileReader();
    reader.onload = function (event) {
        let img = new Image();
        img.onload = function () {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(image[0]);
    uploadBox.style.display = "none";
}

function convertCanvasToImage(canvas) {
    let image = new Image();
    image.src = canvas.toDataURL("image/png");
    return image;
}

uploadImg.onclick = () => {
    if (uploadBox.style.display == "none") {
        uploadBox.style.display = "block";

        closeUploadButton.onclick = () => {
            uploadBox.style.display = "none";
        };
    } else {
        uploadBox.style.display = "none";
    }
};

submitButton.onclick = () => {
    if (fileInput.files[0]) {
        convertImageToCanvas(fileInput.files);
    } else {
        alert("Please select an image");
    }
};

function downloadImage() {
    let canvas = document.getElementById("canvas");
    let downImg = document.getElementById("downImg");
    downImg.href = convertCanvasToImage(canvas).src;
}

downloadButton.onclick = () => {
    downloadImage();
};

//Color picker
let picker = new Picker({
    parent: document.querySelector("#colorPicker"),
    popup: "bottom",
    color: "#000",
    editor: true,
    layout: "default",
    editorFormat: "hex",
});

picker.onChange = (color) => {
    rgbaColor = "rgba(" + color.rgba.toString() + ")";
    rgbaArr = color.rgba;
    document.getElementById("colorBox").style.background = rgbaColor;
    selectBrushBrush();
};

/// Pick a color from canvas

pickColor.onclick = () => {
    canvas.style.cursor = "url('cursor/pick.cur'),auto";
    brushType = "colorPick";
    rainbow.checked = false;
};

//brush size
function selectBrushBrush() {
    canvas.style.cursor = "url('cursor/crosshair.cur'),auto";
    brushType = "brush";
    rainbow.checked = false;
}

brushElement.onclick = () => {
    selectBrushBrush();
};

rangeInput.oninput = () => {
    numberInput.value = rangeInput.value + "px";
    brushSize = rangeInput.value;
};

eraser.onclick = () => {
    canvas.style.cursor = "url('cursor/eraser.cur'),auto";
    brushType = "eraser";
    rainbow.checked = false;
};

//paint bucket

bucket.onclick = () => {
    canvas.style.cursor = "url('cursor/bucket.cur'),auto";
    brushType = "bucket";
};

///Actual Drawing

function init() {
    let bucketReady;
    canvas.onmousedown = (e) => {
        mousePressed = true;
        if (isDone) {
            bucketReady = true;
        }
        Draw(
            e.pageX - canvas.offsetLeft,
            e.pageY - canvas.offsetTop,
            false,
            brushType,
            bucketReady
        );
    };
    canvas.onmousemove = (e) => {
        if (mousePressed) {
            bucketReady = false;
            Draw(
                e.pageX - canvas.offsetLeft,
                e.pageY - canvas.offsetTop,
                true,
                brushType,
                bucketReady
            );
        }
        if (brushType == "colorPick") {
            showColorOnPickIcon(
                e.pageX - canvas.offsetLeft,
                e.pageY - canvas.offsetTop,
                true
            );
        } else {
            showColorOnPickIcon(
                e.pageX - canvas.offsetLeft,
                e.pageY - canvas.offsetTop,
                false
            );
        }
    };
    canvas.onmouseup = () => {
        mousePressed = false;
        if (isDone) {
            bucketReady = true;
        }
    };
    canvas.onmouseout = () => {
        bucketReady = false;
        mousePressed = false;
    };
}

rainbow.onclick = () => {
    if (rainbow.checked) {
        rgbaArr = [256, 1, 0, 1];
        rgbaColor = "rgba(" + rgbaArr.toString() + ")";
        document.getElementById("colorBox").style.background = rgbaColor;
        valueSpeedBox.style.display = "inline-flex";
    } else {
        valueSpeedBox.style.display = "none";
    }
};

valueSpeedBox.onchange = () => {
    if (valueSpeedBox.value > 125) {
        valueSpeedBox.value = 125;
    }
    if (valueSpeedBox.value < 1) {
        valueSpeedBox.value = 1;
    }
};

function rainbowColor() {
    let r, g, b;
    let valueSpeed = parseInt(valueSpeedBox.value);
    r = rgbaArr[0];
    g = rgbaArr[1];
    b = rgbaArr[2];

    if (r == 256 && g > 0 && g < 256 && b == 0) {
        g += valueSpeed;

        if (g > 255) {
            g = 256;
            r -= valueSpeed;
        }
    }
    if (r < 256 && r > 0 && g == 256 && b == 0) {
        r -= valueSpeed;

        if (r < 1) {
            r = 0;
            b += valueSpeed;
        }
    }
    if (r == 0 && g == 256 && b > 0 && b < 256) {
        b += valueSpeed;

        if (b > 255) {
            b = 256;
            g -= valueSpeed;
        }
    }
    if (r == 0 && g > 0 && g < 256 && b == 256) {
        g -= valueSpeed;

        if (g < 1) {
            g = 0;
            r += valueSpeed;
        }
    }
    if (r > 0 && r < 256 && g == 0 && b == 256) {
        r += valueSpeed;

        if (r > 255) {
            r = 256;
            b -= valueSpeed;
        }
    }
    if (r == 256 && g == 0 && b < 256 && b > 0) {
        b -= valueSpeed;

        if (b < 1) {
            b = 0;
            g += valueSpeed;
        }
    }

    rgbaArr[0] = r;
    rgbaArr[1] = g;
    rgbaArr[2] = b;

    rgbaColor = "rgba(" + rgbaArr.toString() + ")";
    document.getElementById("colorBox").style.background = rgbaColor;
}

function Draw(x, y, isDown, brushType, bucketReady) {
    if (isDown) {
        if (brushType == "brush") {
            ctx.beginPath();
            if (rainbow.checked) {
                ctx.strokeStyle = rgbaColor;
                rainbowColor();
            } else {
                ctx.strokeStyle = rgbaColor;
            }
            ctx.lineWidth = brushSize;
            ctx.lineJoin = "round";
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(x, y);
            ctx.closePath();
            ctx.stroke();
        }
        if (brushType == "eraser") {
            ctx.beginPath();
            ctx.strokeStyle = "white";
            ctx.lineWidth = brushSize;
            ctx.lineJoin = "round";
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(x, y);
            ctx.closePath();
            ctx.stroke();
        }
    }
    if (brushType == "colorPick") {
        let imageData = ctx.getImageData(x, y, 1, 1);
        rgbaArr = imageData.data;
        imageData = "rgba(" + imageData.data.toString() + ")";
        if (imageData == "rgba(0,0,0,0)") {
            imageData = "rgba(255,255,255,1)";
        }
        rgbaColor = imageData;
        document.getElementById("colorBox").style.background = rgbaColor;
        selectBrushBrush();
    }
    if (brushType == "bucket" && bucketReady) {
        bucketFill(x, y);
    }

    lastX = x;
    lastY = y;
}

function bucketFill(startX, startY) {
    isDone = false;
    let colorLayer = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixelStack = [[startX, startY]];
    let startR, startG, startB;
    let startPos;
    startPos = (startX + canvas.width * startY) * 4;
    startR = colorLayer.data[startPos];
    startG = colorLayer.data[startPos + 1];
    startB = colorLayer.data[startPos + 2];

    if (!matchSelectedColor(startPos)) {
        while (pixelStack.length != 0) {
            let newPos, x, y, pixelPos, reachLeft, reachRight;
            newPos = pixelStack.pop();

            x = newPos[0];
            y = newPos[1];

            pixelPos = (y * canvas.width + x) * 4;

            while (y-- >= 0 && matchStartColor(pixelPos)) {
                pixelPos -= canvas.width * 4;
            }
            pixelPos += canvas.width * 4;
            ++y;
            reachLeft = false;
            reachRight = false;

            while (y++ < canvas.height && matchStartColor(pixelPos)) {
                colorPixel(pixelPos);
                if (x > 0) {
                    if (matchStartColor(pixelPos - 4)) {
                        if (!reachLeft) {
                            pixelStack.push([x - 1, y]);
                            reachLeft = true;
                        }
                    } else if (reachLeft) {
                        reachLeft = false;
                    }
                }
                if (x < canvas.width) {
                    if (matchStartColor(pixelPos + 4)) {
                        if (!reachRight) {
                            pixelStack.push([x + 1, y]);
                            reachRight = true;
                        }
                    } else if (reachRight) {
                        reachRight = false;
                    }
                }
                pixelPos += canvas.width * 4;
            }
        }
    }

    ctx.putImageData(colorLayer, 0, 0);

    function matchSelectedColor(pixelPos) {
        let r = colorLayer.data[pixelPos];
        let g = colorLayer.data[pixelPos + 1];
        let b = colorLayer.data[pixelPos + 2];

        if (r == rgbaArr[0] && g == rgbaArr[1] && b == rgbaArr[2]) {
            return true;
        } else {
            return false;
        }
    }

    function matchStartColor(pixelPos) {
        let r = colorLayer.data[pixelPos];
        let g = colorLayer.data[pixelPos + 1];
        let b = colorLayer.data[pixelPos + 2];

        if (r == startR && g == startG && b == startB) {
            return true;
        } else {
            return false;
        }
    }

    function colorPixel(pixelPos) {
        colorLayer.data[pixelPos] = rgbaArr[0];
        colorLayer.data[pixelPos + 1] = rgbaArr[1];
        colorLayer.data[pixelPos + 2] = rgbaArr[2];
        colorLayer.data[pixelPos + 3] = 255;

        if (!matchStartColor(pixelPos - 4)) {
            colorLayer.data[pixelPos - 4] = rgbaArr[0];
            colorLayer.data[pixelPos + 1 - 4] = rgbaArr[1];
            colorLayer.data[pixelPos + 2 - 4] = rgbaArr[2];
            colorLayer.data[pixelPos + 3 - 4] = 255;
        }
        if (!matchStartColor(pixelPos + 4)) {
            colorLayer.data[pixelPos + 4] = rgbaArr[0];
            colorLayer.data[pixelPos + 1 + 4] = rgbaArr[1];
            colorLayer.data[pixelPos + 2 + 4] = rgbaArr[2];
            colorLayer.data[pixelPos + 3 + 4] = 255;
        }
        if (!matchStartColor(pixelPos + canvas.width * 4)) {
            colorLayer.data[pixelPos + canvas.width * 4] = rgbaArr[0];
            colorLayer.data[pixelPos + 1 + canvas.width * 4] = rgbaArr[1];
            colorLayer.data[pixelPos + 2 + canvas.width * 4] = rgbaArr[2];
            colorLayer.data[pixelPos + 3 + canvas.width * 4] = 255;
        }
        if (!matchStartColor(pixelPos - canvas.width * 4)) {
            colorLayer.data[pixelPos - canvas.width * 4] = rgbaArr[0];
            colorLayer.data[pixelPos + 1 - canvas.width * 4] = rgbaArr[1];
            colorLayer.data[pixelPos + 2 - canvas.width * 4] = rgbaArr[2];
            colorLayer.data[pixelPos + 3 - canvas.width * 4] = 255;
        }
    }

    isDone = true;
}

function showColorOnPickIcon(x, y, showColor) {
    if (showColor) {
        let imageData = ctx.getImageData(x, y, 1, 1);
        imageData = "rgba(" + imageData.data.toString() + ")";
        if (imageData == "rgba(0,0,0,0)") {
            imageData = "rgba(255,255,255,1)";
        }

        pickColor.style.color = imageData;
    } else {
        pickColor.style.color = "white";
    }
}
