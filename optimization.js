// Performance Optimization Module
class PortfolioOptimizer {
    constructor() {
        this.initLazyLoading();
        this.initResourceMonitoring();
        this.initCriticalCSS();
    }

    // Lazy Loading for Images
    initLazyLoading() {
        const images = document.querySelectorAll('img[loading="lazy"]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for browsers without IntersectionObserver
            images.forEach(img => {
                img.src = img.dataset.src || img.src;
            });
        }
    }

    // Monitor Resource Loading
    initResourceMonitoring() {
        if ('performance' in window) {
            window.addEventListener('load', () => {
                const resources = performance.getEntriesByType('resource');
                const slowResources = resources.filter(r => r.duration > 1000);
                
                if (slowResources.length > 0) {
                    console.warn('Slow resources detected:', slowResources);
                    this.logPerformanceMetrics();
                }
            });
        }
    }

    // Extract Critical CSS (simulated)
    initCriticalCSS() {
        // In a real application, you would extract above-the-fold CSS
        // This is a simplified version
        const criticalStyles = `
            .hero, .nav-container, .section-title {
                opacity: 0;
                animation: fadeIn 0.5s ease forwards;
            }
            
            @keyframes fadeIn {
                to { opacity: 1; }
            }
        `;

        const style = document.createElement('style');
        style.textContent = criticalStyles;
        document.head.appendChild(style);
    }

    // Log Performance Metrics
    logPerformanceMetrics() {
        if ('performance' in window) {
            const timing = performance.timing;
            const metrics = {
                dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
                tcpConnect: timing.connectEnd - timing.connectStart,
                serverResponse: timing.responseEnd - timing.requestStart,
                domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
                fullLoad: timing.loadEventEnd - timing.navigationStart
            };

            console.table(metrics);
            return metrics;
        }
        return null;
    }

    // Compress Images (Client-side simulation)
    static async compressImage(file, maxWidth = 1200, quality = 0.8) {
        return new Promise((resolve) => {
            if (!file.type.includes('image')) {
                resolve(file);
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(
                        (blob) => {
                            resolve(new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now()
                            }));
                        },
                        'image/jpeg',
                        quality
                    );
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }
}

// Initialize optimizer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.portfolioOptimizer = new PortfolioOptimizer();
});

// Utility function to measure execution time
function measureExecutionTime(fn, label = 'Function') {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`${label} took ${(end - start).toFixed(2)}ms`);
    return result;
}

// Debounce function for performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for performance optimization
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Cache expensive calculations
function memoize(fn) {
    const cache = new Map();
    return function(...args) {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key);
        }
        const result = fn.apply(this, args);
        cache.set(key, result);
        return result;
    };
}