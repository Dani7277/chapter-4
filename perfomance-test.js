// Performance Testing Module
class PerformanceTester {
    constructor() {
        this.metrics = {};
        this.startTime = performance.now();
    }

    // Measure page load performance
    measurePageLoad() {
        if ('performance' in window) {
            const timing = performance.timing;
            
            this.metrics.pageLoad = {
                dns: timing.domainLookupEnd - timing.domainLookupStart,
                tcp: timing.connectEnd - timing.connectStart,
                ttfb: timing.responseStart - timing.requestStart,
                domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
                fullLoad: timing.loadEventEnd - timing.navigationStart
            };
        }
        
        return this.metrics.pageLoad;
    }

    // Measure resource loading
    measureResources() {
        if ('performance' in window) {
            const resources = performance.getEntriesByType('resource');
            
            this.metrics.resources = resources.map(resource => ({
                name: resource.name,
                duration: resource.duration,
                size: resource.transferSize || 0,
                type: resource.initiatorType
            }));
            
            // Group by type
            this.metrics.resourceSummary = this.metrics.resources.reduce((acc, resource) => {
                if (!acc[resource.type]) {
                    acc[resource.type] = {
                        count: 0,
                        totalSize: 0,
                        averageTime: 0,
                        items: []
                    };
                }
                
                acc[resource.type].count++;
                acc[resource.type].totalSize += resource.size;
                acc[resource.type].items.push(resource);
                
                return acc;
            }, {});
            
            // Calculate averages
            Object.keys(this.metrics.resourceSummary).forEach(type => {
                const summary = this.metrics.resourceSummary[type];
                summary.averageTime = summary.items.reduce((sum, item) => sum + item.duration, 0) / summary.count;
            });
        }
        
        return this.metrics.resources;
    }

    // Measure memory usage (if available)
    measureMemory() {
        if ('memory' in performance) {
            this.metrics.memory = {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            };
        }
        
        return this.metrics.memory;
    }

    // Measure FPS (Frames Per Second)
    async measureFPS(duration = 1000) {
        return new Promise((resolve) => {
            let frames = 0;
            let startTime = null;
            
            const measureFrame = (timestamp) => {
                if (!startTime) startTime = timestamp;
                
                frames++;
                
                if (timestamp - startTime < duration) {
                    requestAnimationFrame(measureFrame);
                } else {
                    const fps = Math.round((frames * 1000) / duration);
                    this.metrics.fps = fps;
                    resolve(fps);
                }
            };
            
            requestAnimationFrame(measureFrame);
        });
    }

    // Run Lighthouse-like audit
    async runAudit() {
        const audit = {
            performance: {},
            bestPractices: {},
            accessibility: {},
            seo: {}
        };

        // Performance checks
        audit.performance.imageOptimization = this.checkImageOptimization();
        audit.performance.cssSize = this.checkCSSSize();
        audit.performance.jsSize = this.checkJSSize();
        audit.performance.fontLoading = this.checkFontLoading();

        // Best practices checks
        audit.bestPractices.https = this.checkHTTPS();
        audit.bestPractices.consoleErrors = this.checkConsoleErrors();
        audit.bestPractices.deprecatedAPI = this.checkDeprecatedAPI();

        // Accessibility checks
        audit.accessibility.altTags = this.checkAltTags();
        audit.accessibility.ariaLabels = this.checkAriaLabels();
        audit.accessibility.colorContrast = this.checkColorContrast();

        // SEO checks
        audit.seo.metaTags = this.checkMetaTags();
        audit.seo.headingStructure = this.checkHeadingStructure();
        audit.seo.semanticHTML = this.checkSemanticHTML();

        this.metrics.audit = audit;
        return audit;
    }

    // Individual audit checks
    checkImageOptimization() {
        const images = document.querySelectorAll('img');
        const largeImages = Array.from(images).filter(img => {
            const naturalWidth = img.naturalWidth;
            const displayWidth = img.offsetWidth;
            return naturalWidth > displayWidth * 2;
        });
        
        return {
            score: largeImages.length === 0 ? 100 : Math.max(0, 100 - (largeImages.length * 20)),
            issues: largeImages.map(img => `Image "${img.src}" is larger than needed`)
        };
    }

    checkCSSSize() {
        const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
        let totalSize = 0;
        
        // This is a simulation - in real implementation, you'd fetch and measure actual sizes
        stylesheets.forEach(sheet => {
            if (sheet.href && !sheet.href.includes('fonts.googleapis.com')) {
                totalSize += 5000; // Simulated average size
            }
        });
        
        return {
            score: totalSize < 10000 ? 100 : Math.max(0, 100 - ((totalSize - 10000) / 1000)),
            size: totalSize
        };
    }

    checkJSSize() {
        const scripts = document.querySelectorAll('script[src]');
        const totalSize = scripts.length * 10000; // Simulated average size
        
        return {
            score: totalSize < 30000 ? 100 : Math.max(0, 100 - ((totalSize - 30000) / 1000)),
            size: totalSize
        };
    }

    checkFontLoading() {
        const fonts = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
        return {
            score: fonts.length <= 2 ? 100 : 50,
            warning: fonts.length > 2 ? 'Too many font requests' : null
        };
    }

    checkHTTPS() {
        return {
            score: window.location.protocol === 'https:' ? 100 : 0,
            secure: window.location.protocol === 'https:'
        };
    }

    checkConsoleErrors() {
        // This would need to be set up to catch errors globally
        return {
            score: 100, // Placeholder
            errors: []
        };
    }

    checkDeprecatedAPI() {
        const deprecatedSelectors = ['applet', 'marquee', 'frameset', 'frame'];
        const found = deprecatedSelectors.filter(selector => 
            document.querySelector(selector)
        );
        
        return {
            score: found.length === 0 ? 100 : 0,
            deprecated: found
        };
    }

    checkAltTags() {
        const images = document.querySelectorAll('img');
        const missingAlt = Array.from(images).filter(img => !img.alt);
        
        return {
            score: images.length === 0 ? 100 : Math.round((1 - missingAlt.length / images.length) * 100),
            missing: missingAlt.length
        };
    }

    checkAriaLabels() {
        const interactiveElements = document.querySelectorAll('button, a, input, [role]');
        const unlabeled = Array.from(interactiveElements).filter(el => 
            !el.getAttribute('aria-label') && 
            !el.textContent.trim() && 
            !el.getAttribute('title')
        );
        
        return {
            score: interactiveElements.length === 0 ? 100 : Math.round((1 - unlabeled.length / interactiveElements.length) * 100),
            unlabeled: unlabeled.length
        };
    }

    checkColorContrast() {
        // This is a simplified check - real implementation would use the Accessibility API
        return {
            score: 85, // Placeholder
            warning: 'Run detailed contrast check with browser tools'
        };
    }

    checkMetaTags() {
        const requiredMeta = ['description', 'viewport'];
        const presentMeta = requiredMeta.filter(meta => 
            document.querySelector(`meta[name="${meta}"]`)
        );
        
        return {
            score: Math.round((presentMeta.length / requiredMeta.length) * 100),
            missing: requiredMeta.filter(meta => !presentMeta.includes(meta))
        };
    }

    checkHeadingStructure() {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let lastLevel = 0;
        let structureErrors = 0;
        
        headings.forEach(heading => {
            const level = parseInt(heading.tagName[1]);
            if (level > lastLevel + 1) {
                structureErrors++;
            }
            lastLevel = level;
        });
        
        return {
            score: headings.length === 0 ? 100 : Math.max(0, 100 - (structureErrors * 20)),
            errors: structureErrors
        };
    }

    checkSemanticHTML() {
        const semanticElements = ['header', 'nav', 'main', 'section', 'article', 'aside', 'footer'];
        const present = semanticElements.filter(tag => 
            document.querySelector(tag)
        );
        
        return {
            score: Math.round((present.length / semanticElements.length) * 100),
            missing: semanticElements.filter(tag => !present.includes(tag))
        };
    }

    // Generate performance report
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            metrics: this.metrics,
            scores: this.calculateScores(),
            recommendations: this.generateRecommendations()
        };
        
        return report;
    }

    calculateScores() {
        const scores = {
            performance: 85,
            accessibility: 90,
            bestPractices: 88,
            seo: 92,
            overall: 89
        };
        
        if (this.metrics.audit) {
            // Calculate based on audit results
            scores.performance = this.calculateCategoryScore(this.metrics.audit.performance);
            scores.accessibility = this.calculateCategoryScore(this.metrics.audit.accessibility);
            scores.bestPractices = this.calculateCategoryScore(this.metrics.audit.bestPractices);
            scores.seo = this.calculateCategoryScore(this.metrics.audit.seo);
            scores.overall = Math.round((scores.performance + scores.accessibility + scores.bestPractices + scores.seo) / 4);
        }
        
        return scores;
    }

    calculateCategoryScore(category) {
        const scores = Object.values(category).map(item => item.score || 0);
        return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    }

    generateRecommendations() {
        const recommendations = [];
        
        if (this.metrics.audit) {
            const audit = this.metrics.audit;
            
            // Performance recommendations
            if (audit.performance.imageOptimization.score < 80) {
                recommendations.push('Optimize images by resizing to appropriate dimensions');
            }
            
            if (audit.performance.cssSize.score < 80) {
                recommendations.push('Minify and compress CSS files');
            }
            
            // Accessibility recommendations
            if (audit.accessibility.altTags.score < 100) {
                recommendations.push('Add alt text to all images');
            }
            
            // SEO recommendations
            if (audit.seo.metaTags.score < 100) {
                recommendations.push('Add missing meta tags (description, viewport)');
            }
        }
        
        return recommendations;
    }

    // Run full test suite
    async runFullTest() {
        console.log('🚀 Starting performance test...');
        
        // Measure various metrics
        this.measurePageLoad();
        this.measureResources();
        this.measureMemory();
        await this.measureFPS();
        await this.runAudit();
        
        const report = this.generateReport();
        
        console.log('📊 Performance Test Results');
        console.log('==========================');
        console.log(`Overall Score: ${report.scores.overall}/100`);
        console.log(`Performance: ${report.scores.performance}/100`);
        console.log(`Accessibility: ${report.scores.accessibility}/100`);
        console.log(`Best Practices: ${report.scores.bestPractices}/100`);
        console.log(`SEO: ${report.scores.seo}/100`);
        
        console.log('\n💡 Recommendations:');
        report.recommendations.forEach((rec, index) => {
            console.log(`${index + 1}. ${rec}`);
        });
        
        return report;
    }
}

// Initialize and run when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    window.performanceTester = new PerformanceTester();
    
    // Auto-run test after page load
    setTimeout(async () => {
        await window.performanceTester.runFullTest();
    }, 2000);
});

// Export for Node.js usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceTester;
}// Performance Testing Module
class PerformanceTester {
    constructor() {
        this.metrics = {};
        this.startTime = performance.now();
    }

    // Measure page load performance
    measurePageLoad() {
        if ('performance' in window) {
            const timing = performance.timing;
            
            this.metrics.pageLoad = {
                dns: timing.domainLookupEnd - timing.domainLookupStart,
                tcp: timing.connectEnd - timing.connectStart,
                ttfb: timing.responseStart - timing.requestStart,
                domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
                fullLoad: timing.loadEventEnd - timing.navigationStart
            };
        }
        
        return this.metrics.pageLoad;
    }

    // Measure resource loading
    measureResources() {
        if ('performance' in window) {
            const resources = performance.getEntriesByType('resource');
            
            this.metrics.resources = resources.map(resource => ({
                name: resource.name,
                duration: resource.duration,
                size: resource.transferSize || 0,
                type: resource.initiatorType
            }));
            
            // Group by type
            this.metrics.resourceSummary = this.metrics.resources.reduce((acc, resource) => {
                if (!acc[resource.type]) {
                    acc[resource.type] = {
                        count: 0,
                        totalSize: 0,
                        averageTime: 0,
                        items: []
                    };
                }
                
                acc[resource.type].count++;
                acc[resource.type].totalSize += resource.size;
                acc[resource.type].items.push(resource);
                
                return acc;
            }, {});
            
            // Calculate averages
            Object.keys(this.metrics.resourceSummary).forEach(type => {
                const summary = this.metrics.resourceSummary[type];
                summary.averageTime = summary.items.reduce((sum, item) => sum + item.duration, 0) / summary.count;
            });
        }
        
        return this.metrics.resources;
    }

    // Measure memory usage (if available)
    measureMemory() {
        if ('memory' in performance) {
            this.metrics.memory = {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            };
        }
        
        return this.metrics.memory;
    }

    // Measure FPS (Frames Per Second)
    async measureFPS(duration = 1000) {
        return new Promise((resolve) => {
            let frames = 0;
            let startTime = null;
            
            const measureFrame = (timestamp) => {
                if (!startTime) startTime = timestamp;
                
                frames++;
                
                if (timestamp - startTime < duration) {
                    requestAnimationFrame(measureFrame);
                } else {
                    const fps = Math.round((frames * 1000) / duration);
                    this.metrics.fps = fps;
                    resolve(fps);
                }
            };
            
            requestAnimationFrame(measureFrame);
        });
    }

    // Run Lighthouse-like audit
    async runAudit() {
        const audit = {
            performance: {},
            bestPractices: {},
            accessibility: {},
            seo: {}
        };

        // Performance checks
        audit.performance.imageOptimization = this.checkImageOptimization();
        audit.performance.cssSize = this.checkCSSSize();
        audit.performance.jsSize = this.checkJSSize();
        audit.performance.fontLoading = this.checkFontLoading();

        // Best practices checks
        audit.bestPractices.https = this.checkHTTPS();
        audit.bestPractices.consoleErrors = this.checkConsoleErrors();
        audit.bestPractices.deprecatedAPI = this.checkDeprecatedAPI();

        // Accessibility checks
        audit.accessibility.altTags = this.checkAltTags();
        audit.accessibility.ariaLabels = this.checkAriaLabels();
        audit.accessibility.colorContrast = this.checkColorContrast();

        // SEO checks
        audit.seo.metaTags = this.checkMetaTags();
        audit.seo.headingStructure = this.checkHeadingStructure();
        audit.seo.semanticHTML = this.checkSemanticHTML();

        this.metrics.audit = audit;
        return audit;
    }

    // Individual audit checks
    checkImageOptimization() {
        const images = document.querySelectorAll('img');
        const largeImages = Array.from(images).filter(img => {
            const naturalWidth = img.naturalWidth;
            const displayWidth = img.offsetWidth;
            return naturalWidth > displayWidth * 2;
        });
        
        return {
            score: largeImages.length === 0 ? 100 : Math.max(0, 100 - (largeImages.length * 20)),
            issues: largeImages.map(img => `Image "${img.src}" is larger than needed`)
        };
    }

    checkCSSSize() {
        const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
        let totalSize = 0;
        
        // This is a simulation - in real implementation, you'd fetch and measure actual sizes
        stylesheets.forEach(sheet => {
            if (sheet.href && !sheet.href.includes('fonts.googleapis.com')) {
                totalSize += 5000; // Simulated average size
            }
        });
        
        return {
            score: totalSize < 10000 ? 100 : Math.max(0, 100 - ((totalSize - 10000) / 1000)),
            size: totalSize
        };
    }

    checkJSSize() {
        const scripts = document.querySelectorAll('script[src]');
        const totalSize = scripts.length * 10000; // Simulated average size
        
        return {
            score: totalSize < 30000 ? 100 : Math.max(0, 100 - ((totalSize - 30000) / 1000)),
            size: totalSize
        };
    }

    checkFontLoading() {
        const fonts = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
        return {
            score: fonts.length <= 2 ? 100 : 50,
            warning: fonts.length > 2 ? 'Too many font requests' : null
        };
    }

    checkHTTPS() {
        return {
            score: window.location.protocol === 'https:' ? 100 : 0,
            secure: window.location.protocol === 'https:'
        };
    }

    checkConsoleErrors() {
        // This would need to be set up to catch errors globally
        return {
            score: 100, // Placeholder
            errors: []
        };
    }

    checkDeprecatedAPI() {
        const deprecatedSelectors = ['applet', 'marquee', 'frameset', 'frame'];
        const found = deprecatedSelectors.filter(selector => 
            document.querySelector(selector)
        );
        
        return {
            score: found.length === 0 ? 100 : 0,
            deprecated: found
        };
    }

    checkAltTags() {
        const images = document.querySelectorAll('img');
        const missingAlt = Array.from(images).filter(img => !img.alt);
        
        return {
            score: images.length === 0 ? 100 : Math.round((1 - missingAlt.length / images.length) * 100),
            missing: missingAlt.length
        };
    }

    checkAriaLabels() {
        const interactiveElements = document.querySelectorAll('button, a, input, [role]');
        const unlabeled = Array.from(interactiveElements).filter(el => 
            !el.getAttribute('aria-label') && 
            !el.textContent.trim() && 
            !el.getAttribute('title')
        );
        
        return {
            score: interactiveElements.length === 0 ? 100 : Math.round((1 - unlabeled.length / interactiveElements.length) * 100),
            unlabeled: unlabeled.length
        };
    }

    checkColorContrast() {
        // This is a simplified check - real implementation would use the Accessibility API
        return {
            score: 85, // Placeholder
            warning: 'Run detailed contrast check with browser tools'
        };
    }

    checkMetaTags() {
        const requiredMeta = ['description', 'viewport'];
        const presentMeta = requiredMeta.filter(meta => 
            document.querySelector(`meta[name="${meta}"]`)
        );
        
        return {
            score: Math.round((presentMeta.length / requiredMeta.length) * 100),
            missing: requiredMeta.filter(meta => !presentMeta.includes(meta))
        };
    }

    checkHeadingStructure() {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let lastLevel = 0;
        let structureErrors = 0;
        
        headings.forEach(heading => {
            const level = parseInt(heading.tagName[1]);
            if (level > lastLevel + 1) {
                structureErrors++;
            }
            lastLevel = level;
        });
        
        return {
            score: headings.length === 0 ? 100 : Math.max(0, 100 - (structureErrors * 20)),
            errors: structureErrors
        };
    }

    checkSemanticHTML() {
        const semanticElements = ['header', 'nav', 'main', 'section', 'article', 'aside', 'footer'];
        const present = semanticElements.filter(tag => 
            document.querySelector(tag)
        );
        
        return {
            score: Math.round((present.length / semanticElements.length) * 100),
            missing: semanticElements.filter(tag => !present.includes(tag))
        };
    }

    // Generate performance report
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            metrics: this.metrics,
            scores: this.calculateScores(),
            recommendations: this.generateRecommendations()
        };
        
        return report;
    }

    calculateScores() {
        const scores = {
            performance: 85,
            accessibility: 90,
            bestPractices: 88,
            seo: 92,
            overall: 89
        };
        
        if (this.metrics.audit) {
            // Calculate based on audit results
            scores.performance = this.calculateCategoryScore(this.metrics.audit.performance);
            scores.accessibility = this.calculateCategoryScore(this.metrics.audit.accessibility);
            scores.bestPractices = this.calculateCategoryScore(this.metrics.audit.bestPractices);
            scores.seo = this.calculateCategoryScore(this.metrics.audit.seo);
            scores.overall = Math.round((scores.performance + scores.accessibility + scores.bestPractices + scores.seo) / 4);
        }
        
        return scores;
    }

    calculateCategoryScore(category) {
        const scores = Object.values(category).map(item => item.score || 0);
        return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    }

    generateRecommendations() {
        const recommendations = [];
        
        if (this.metrics.audit) {
            const audit = this.metrics.audit;
            
            // Performance recommendations
            if (audit.performance.imageOptimization.score < 80) {
                recommendations.push('Optimize images by resizing to appropriate dimensions');
            }
            
            if (audit.performance.cssSize.score < 80) {
                recommendations.push('Minify and compress CSS files');
            }
            
            // Accessibility recommendations
            if (audit.accessibility.altTags.score < 100) {
                recommendations.push('Add alt text to all images');
            }
            
            // SEO recommendations
            if (audit.seo.metaTags.score < 100) {
                recommendations.push('Add missing meta tags (description, viewport)');
            }
        }
        
        return recommendations;
    }

    // Run full test suite
    async runFullTest() {
        console.log('🚀 Starting performance test...');
        
        // Measure various metrics
        this.measurePageLoad();
        this.measureResources();
        this.measureMemory();
        await this.measureFPS();
        await this.runAudit();
        
        const report = this.generateReport();
        
        console.log('📊 Performance Test Results');
        console.log('==========================');
        console.log(`Overall Score: ${report.scores.overall}/100`);
        console.log(`Performance: ${report.scores.performance}/100`);
        console.log(`Accessibility: ${report.scores.accessibility}/100`);
        console.log(`Best Practices: ${report.scores.bestPractices}/100`);
        console.log(`SEO: ${report.scores.seo}/100`);
        
        console.log('\n💡 Recommendations:');
        report.recommendations.forEach((rec, index) => {
            console.log(`${index + 1}. ${rec}`);
        });
        
        return report;
    }
}

// Initialize and run when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    window.performanceTester = new PerformanceTester();
    
    // Auto-run test after page load
    setTimeout(async () => {
        await window.performanceTester.runFullTest();
    }, 2000);
});

// Export for Node.js usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceTester;
}