const fs = require('fs');
const path = require('path');
const { minify } = require('terser');
const CleanCSS = require('clean-css');

// Configuration
const config = {
    input: {
        css: 'styles.css',
        js: 'scripts.js',
        optimization: 'optimization.js'
    },
    output: {
        css: 'dist/styles.min.css',
        js: 'dist/scripts.min.js',
        optimization: 'dist/optimization.min.js'
    }
};

// Ensure dist directory exists
if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
}

// Minify JavaScript
async function minifyJS(inputFile, outputFile) {
    try {
        const code = fs.readFileSync(inputFile, 'utf8');
        const result = await minify(code, {
            compress: {
                drop_console: false,
                drop_debugger: true
            },
            mangle: {
                toplevel: false
            },
            format: {
                comments: false
            }
        });

        if (result.error) {
            throw result.error;
        }

        fs.writeFileSync(outputFile, result.code);
        console.log(`✓ Minified ${path.basename(inputFile)} (${code.length} → ${result.code.length} bytes)`);
        
        return {
            originalSize: code.length,
            minifiedSize: result.code.length,
            savings: ((code.length - result.code.length) / code.length * 100).toFixed(1)
        };
    } catch (error) {
        console.error(`Error minifying ${inputFile}:`, error);
        return null;
    }
}

// Minify CSS
function minifyCSS(inputFile, outputFile) {
    try {
        const css = fs.readFileSync(inputFile, 'utf8');
        const result = new CleanCSS({
            level: {
                1: {
                    all: true,
                    normalizeUrls: false
                },
                2: {
                    all: true
                }
            }
        }).minify(css);

        if (result.errors.length > 0) {
            throw new Error(result.errors.join('\n'));
        }

        fs.writeFileSync(outputFile, result.styles);
        console.log(`✓ Minified ${path.basename(inputFile)} (${css.length} → ${result.styles.length} bytes)`);
        
        return {
            originalSize: css.length,
            minifiedSize: result.styles.length,
            savings: ((css.length - result.styles.length) / css.length * 100).toFixed(1)
        };
    } catch (error) {
        console.error(`Error minifying ${inputFile}:`, error);
        return null;
    }
}

// Generate HTML with minified files
function updateHTML() {
    const htmlPath = 'index.html';
    let html = fs.readFileSync(htmlPath, 'utf8');
    
    // Replace CSS and JS references with minified versions
    html = html.replace(
        /<link rel="stylesheet" href="styles\.css">/,
        '<link rel="stylesheet" href="dist/styles.min.css">'
    );
    
    html = html.replace(
        /<script src="scripts\.js"><\/script>/,
        '<script src="dist/scripts.min.js" defer></script>'
    );
    
    html = html.replace(
        /<script src="optimization\.js"><\/script>/,
        '<script src="dist/optimization.min.js" defer></script>'
    );
    
    // Add preload for critical resources
    const preloadTags = `
    <link rel="preload" href="dist/styles.min.css" as="style">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin>
    `;
    
    html = html.replace('</head>', `${preloadTags}</head>`);
    
    // Create optimized HTML file
    fs.writeFileSync('dist/index.html', html);
    console.log('✓ Generated optimized HTML');
}

// Generate build report
function generateReport(stats) {
    const report = `
# Build Report
Generated: ${new Date().toISOString()}

## File Size Reduction
${stats.map(stat => 
    `- ${stat.file}: ${stat.originalSize} bytes → ${stat.minifiedSize} bytes (${stat.savings}% reduction)`
).join('\n')}

## Total Savings
Original: ${stats.reduce((sum, stat) => sum + stat.originalSize, 0)} bytes
Minified: ${stats.reduce((sum, stat) => sum + stat.minifiedSize, 0)} bytes
Total Reduction: ${stats.reduce((sum, stat) => sum + (stat.originalSize - stat.minifiedSize), 0)} bytes

## Performance Recommendations
1. Enable GZIP compression on server
2. Use CDN for Font Awesome and Google Fonts
3. Implement caching headers
4. Consider WebP format for images
    `;
    
    fs.writeFileSync('dist/build-report.md', report);
    console.log('✓ Generated build report');
}

// Main build function
async function build() {
    console.log('🚀 Starting build process...\n');
    
    const stats = [];
    
    // Minify CSS
    const cssStats = minifyCSS(config.input.css, config.output.css);
    if (cssStats) {
        stats.push({ file: 'CSS', ...cssStats });
    }
    
    // Minify JavaScript files
    const jsFiles = [
        { input: config.input.js, output: config.output.js, name: 'Main JS' },
        { input: config.input.optimization, output: config.output.optimization, name: 'Optimization JS' }
    ];
    
    for (const jsFile of jsFiles) {
        const jsStats = await minifyJS(jsFile.input, jsFile.output);
        if (jsStats) {
            stats.push({ file: jsFile.name, ...jsStats });
        }
    }
    
    // Update HTML
    updateHTML();
    
    // Generate report
    generateReport(stats);
    
    console.log('\n✅ Build completed successfully!');
    console.log('📁 Output files in /dist directory');
}

// Run build
if (require.main === module) {
    build().catch(console.error);
}

module.exports = { build, minifyJS, minifyCSS };