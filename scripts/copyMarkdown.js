const fs = require('fs');
const path = require('path');


/**
 * Parses the frontmatter of a Markdown file and extracts metadata.
 *
 * Currently, this function only extracts the `slug` property if present.
 *
 * @param {string} content - The content of the Markdown file.
 * @returns {Object} An object containing the extracted frontmatter properties.
 *                   Example: { slug: '/my-custom-slug' }
 */
function parseFrontmatter(content) {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n/;
    const match = content.match(frontmatterRegex);
    if (!match) return {};

    const frontmatter = match[1];
    const slugMatch = frontmatter.match(/^slug:\s*(.+)$/m);
    return {
        slug: slugMatch ? slugMatch[1].trim() : null,
    };
}

// TODO: Some files are in wrong directories, e.g. `/academy/actor-marketing-playbook.html` and `/academy/get_most_of_actors/actor-marketing-playbook.md`

/**
 * Recursively copies Markdown (.md) files from the source directory to the destination directory,
 * transforming filenames as needed:
 *   - If a custom `slug` is present in the file's frontmatter, the output filename is based on the slug.
 *   - Otherwise, underscores in the filename are replaced with dashes.
 * 
 * This makes Markdown files accessible from the website in the same location as their corresponding HTML files.
 *
 * @param {string} srcDir - The source directory to copy from.
 * @param {string} destDir - The destination directory to copy to.
 */
function copyRecursive(srcDir, destDir) {
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    fs.readdirSync(srcDir).forEach((file) => {
        const srcPath = path.join(srcDir, file);
        const destPath = path.join(destDir, file);
        if (fs.statSync(srcPath).isDirectory()) {
            copyRecursive(srcPath, destPath);
        } else if (file.endsWith('.md')) {
            // Read the file content to check for custom slug
            const content = fs.readFileSync(srcPath, 'utf8');
            const frontmatter = parseFrontmatter(content);

            let targetFilename = file;

            if (frontmatter.slug) {
                // Use the custom slug, but add .md extension
                const slugPath = frontmatter.slug.replace(/^\//, ''); // Remove leading slash
                targetFilename = slugPath.split('/').pop() + '.md';
            } else {
                // Transform filename from underscores to dashes
                targetFilename = file.replace(/_/g, '-');
            }

            const transformedDestPath = path.join(destDir, targetFilename);

            // Copy to the same location as the HTML file would be, but with transformed filename
            fs.copyFileSync(srcPath, transformedDestPath);
            console.log('🤖 Successfully copied Markdown file', srcPath, 'to', transformedDestPath);
        }
    });
}

const src = path.join(__dirname, '../sources');
const dest = path.join(__dirname, '../build');
copyRecursive(src, dest);

console.log(
    '🤖 Markdown files copied from /sources to /build to be accessible from the website'
);
