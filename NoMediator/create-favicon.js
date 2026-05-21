const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'assets', 'favicon.png');
const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';
fs.writeFileSync(filePath, Buffer.from(base64, 'base64'));
console.log('Created', filePath);
