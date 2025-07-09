const fs = require('fs');
const path = require('path');

function copyRecursive(srcDir, destDir) {
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    fs.readdirSync(srcDir).forEach((file) => {
        const srcPath = path.join(srcDir, file);
        const destPath = path.join(destDir, file);
        if (fs.statSync(srcPath).isDirectory()) {
            copyRecursive(srcPath, destPath);
        } else if (file.endsWith('.md')) {
            fs.copyFileSync(srcPath, destPath);
        }
    });
}

const src = path.join(__dirname, '../sources');
const dest = path.join(__dirname, '../build');
copyRecursive(src, dest);

console.log('Markdown files copied from /sources to /build');
