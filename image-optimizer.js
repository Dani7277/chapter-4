// Image Optimization Script
// Note: This is a simulation. In production, use actual image optimization tools.

const fs = require('fs');
const path = require('path');

class ImageOptimizer {
    constructor() {
        this.imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        this.optimizedSizes = {
            thumbnail: { width: 300, height: 200 },
            medium: { width: 600, height: 400 },
            large: { width: 1200, height: 800 }
        };
    }

    // Scan directory for images
    scanDirectory(dir) {
        const images = [];
        
        function scan(currentPath) {
            const items = fs.readdirSync(currentPath);
            
            items.forEach(item => {
                const fullPath = path.join(currentPath, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    scan(fullPath);
                } else if (this.isImageFile(item)) {
                    images.push({
                        path: fullPath,
                        name: item,
                        size: stat.size,
                        extension: path.extname(item).toLowerCase()
                    });
                }
            });
        }
        
        scan.call(this, dir);
        return images;
    }

    isImageFile(filename) {
        const ext = path.extname(filename).toLowerCase();
        return this.imageExtensions.includes(ext);
    }

    // Generate optimization report
    generateReport(images) {
        const totalSize = images.reduce((sum, img) => sum + img.size, 0);
        const totalImages = images.length;
        
        const report = {
            summary: {
                totalImages,
                totalSize: this.formatBytes(totalSize),
                averageSize: this.formatBytes(totalSize / totalImages),
                optimizationOpportunity: this.calculateOptimizationOpportunity(images)
            },
            images: images.map(img => ({
                name: img.name,
                originalSize: this.formatBytes(img.size),
                suggestedOptimization: this.suggestOptimization(img)
            }))
        };
        
        return report;
    }

    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    calculateOptimizationOpportunity(images) {
        // Simulate optimization savings (30-70% reduction)
        const potentialSavings = images.reduce((sum, img) => {
            const savingsPercentage = 0.3 + Math.random() * 0.4; // 30-70%
            return sum + (img.size * savingsPercentage);
        }, 0);
        
        return {
            estimatedSavings: this.formatBytes(potentialSavings),
            percentage: Math.round((potentialSavings / images.reduce((s, i) => s + i.size, 0)) * 100)
        };
    }

    suggestOptimization(image) {
        const suggestions = [];
        
        if (image.size > 1024 * 1024) { // Larger than 1MB
            suggestions.push('Consider resizing to max 1200px width');
        }
        
        if (image.extension === '.png' && image.size > 500 * 1024) {
            suggestions.push('Convert PNG to WebP format for better compression');
        }
        
        if (image.extension === '.jpg' || image.extension === '.jpeg') {
            suggestions.push('Reduce JPEG quality to 80-85%');
        }
        
        if (suggestions.length === 0) {
            suggestions.push('Image is already optimized');
        }
        
        return suggestions;
    }

    // Create responsive image markup
    generateResponsiveImageMarkup(imagePath, altText) {
        const baseName = path.basename(imagePath, path.extname(imagePath));
        
        return `
        <picture>
            <source 
                srcset="images/${baseName}.webp" 
                type="image/webp">
            <source 
                srcset="images/${baseName}.jpg" 
                type="image/jpeg">
            <img 
                src="images/${baseName}.jpg" 
                alt="${altText}"
                loading="lazy"
                width="1200"
                height="800">
        </picture>
        `;
    }

    // Run optimization analysis
    analyze(dir = './') {
        console.log('🔍 Scanning for images...\n');
        
        const images = this.scanDirectory(dir);
        
        if (images.length === 0) {
            console.log('No images found in directory:', dir);
            return;
        }
        
        const report = this.generateReport(images);
        
        console.log('📊 Image Optimization Report');
        console.log('============================');
        console.log(`Total Images: ${report.summary.totalImages}`);
        console.log(`Total Size: ${report.summary.totalSize}`);
        console.log(`Average Size: ${report.summary.averageSize}`);
        console.log(`Optimization Opportunity: ${report.summary.optimizationOpportunity.estimatedSavings} (${report.summary.optimizationOpportunity.percentage}%)`);
        
        console.log('\n📋 Image Details:');
        console.log('================');
        report.images.forEach((img, index) => {
            console.log(`\n${index + 1}. ${img.name}`);
            console.log(`   Size: ${img.originalSize}`);
            console.log(`   Suggestions:`);
            img.suggestedOptimization.forEach(suggestion => {
                console.log(`     - ${suggestion}`);
            });
        });
        
        console.log('\n💡 Optimization Tips:');
        console.log('===================');
        console.log('1. Use WebP format for modern browsers');
        console.log('2. Implement lazy loading for off-screen images');
        console.log('3. Set explicit width and height attributes');
        console.log('4. Use srcset for responsive images');
        console.log('5. Compress images before uploading');
        
        // Generate HTML snippet for responsive images
        console.log('\n🖼️ Responsive Image HTML Snippet:');
        console.log('===============================');
        if (images.length > 0) {
            console.log(this.generateResponsiveImageMarkup(images[0].path, 'Example image description'));
        }
        
        return report;
    }
}

// Run if called directly
if (require.main === module) {
    const optimizer = new ImageOptimizer();
    
    // Get directory from command line or use current directory
    const targetDir = process.argv[2] || '.';
    optimizer.analyze(targetDir);
}

module.exports = ImageOptimizer;