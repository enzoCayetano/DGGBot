const express = require('express');
const { createCanvas } = require('canvas');

const app = express();
const port = 3000;

app.get('/', (req, res) => {
    const canvas = createCanvas(400, 200);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Example text
    ctx.fillStyle = 'white';
    ctx.font = '20px sans-serif';
    ctx.fillText('Hello, World!', 50, 100);

    const buffer = canvas.toBuffer('image/png');
    res.setHeader('Content-Type', 'image/png');
    res.send(buffer);
});

app.listen(port, () => {
    console.log(`Preview at http://localhost:${port}`);
});