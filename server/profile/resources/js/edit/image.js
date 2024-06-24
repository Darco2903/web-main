const PROFILE_PICTURE_SIZE = 512;

/**
 * @param {File} file
 * @returns {Promise<HTMLImageElement>}
 */
export async function loadImage(file) {
    const image = new Image();
    image.src = URL.createObjectURL(file);
    await new Promise((resolve) => {
        image.onload = resolve;
    });
    return image;
}

/**
 * @param {HTMLImageElement} image
 * @param {string} mimeType
 * @returns {Promise<Blob>}
 */
export async function resizeImage(image, mimeType) {
    // square image in the center
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const size = Math.min(image.width, image.height);
    const imageSize = Math.min(size, PROFILE_PICTURE_SIZE);
    canvas.width = imageSize;
    canvas.height = imageSize;
    ctx.drawImage(image, (image.width - size) / 2, (image.height - size) / 2, size, size, 0, 0, imageSize, imageSize);
    return new Promise((resolve) => {
        canvas.toBlob(resolve, mimeType, 0.9);
    });
}

// this function does the same thing as the previous one, but for gifs using gif.js
/**
 * @param {HTMLImageElement} image
 * @returns {Promise<Blob>}
 */
export async function resizeGif(image) {
    return new Promise((resolve) => {
        const gif = new GIF({
            workers: 2,
            quality: 10,
        });

        // Use canvas to manipulate frames
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Draw the first frame to get dimensions
        ctx.drawImage(image, 0, 0);
        const width = image.width;
        const height = image.height;
        const cropWidth = 100; // Example crop width
        const cropHeight = 100; // Example crop height

        // Extract frames
        console.log("Extracting frames");
        const gifFrames = new SuperGif({ gif: image });
        console.log("SuperGif created");

        gifFrames.load(() => {
            for (let i = 1; i <= gifFrames.get_length(); i++) {
                gifFrames.move_to(i - 1);
                const frameCanvas = gifFrames.get_canvas();
                ctx.clearRect(0, 0, width, height);
                ctx.drawImage(frameCanvas, 0, 0, cropWidth, cropHeight);

                // Add cropped frame to GIF
                // gif.addFrame(ctx, { copy: true });
                gif.addFrame(ctx, { copy: true, delay: gifFrames.get_delay(i) });
            }
            // Render the final GIF
            gif.on("finished", resolve);

            gif.render();
        });
    });
}
