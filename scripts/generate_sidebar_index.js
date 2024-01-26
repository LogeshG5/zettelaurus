const fs = require('fs');
const path = require('path');

function parseMarkdownFiles(directoryPath, outputPath) {
    const directoryTree = parseDirectoryRecursively(directoryPath);
    const data = {
        label: "Docs Sidebar",
        items: directoryTree
    }
    // Write the data to a JSON file
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
}

function parseDirectoryRecursively(directoryPath) {
    const files = fs.readdirSync(directoryPath);
    const result = [];

    files.forEach((file) => {
        const filePath = path.join(directoryPath, file);
        const stats = fs.statSync(filePath);

        // Ignore hidden and empty directories
        if (!file.startsWith('.') && stats.isDirectory()) {
            // Recursively parse markdown files in subdirectories
            const subdirectoryData = parseDirectoryRecursively(filePath);

            // Only add directories that have content
            if (subdirectoryData.length > 0 || hasMarkdownFiles(filePath)) {
                result.push({
                    title: file,
                    _template: 'category',
                    link: "generated",
                    items: subdirectoryData,
                });
            }
        } else if (stats.isFile() && (file.endsWith('.md') || file.endsWith('.mdx'))) {
            // Parse the markdown file and add its content to the result
            const filePathStr = filePath.replaceAll("\\", "/");
            result.push({
                document: filePathStr,
                _template: 'doc',
            });
        }
    });

    return result;
}

function hasMarkdownFiles(directoryPath) {
    const files = fs.readdirSync(directoryPath);
    return files.some((file) => fs.statSync(path.join(directoryPath, file)).isFile() && file.endsWith('.md'));
}

// Example usage
const directoryPath = 'docs';
const outputPath = 'config/sidebar/index.json';

parseMarkdownFiles(directoryPath, outputPath);
