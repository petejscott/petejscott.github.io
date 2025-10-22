/**
 * GitHub Gallery Fetcher
 * Fetches image data from a GitHub repository with caching
 */
(function(window) {
    'use strict';

    const CACHE_KEY = 'dreamtigers_gallery_cache';
    const CACHE_SHA_KEY = 'dreamtigers_gallery_sha';
    
    /**
     * Fetches gallery data from GitHub repository
     * @param {string} owner - GitHub username
     * @param {string} repo - Repository name
     * @param {string} path - Path to images directory (empty string for root)
     * @param {string} branch - Branch name
     * @returns {Promise<Array>} Array of photo objects
     */
    async function fetchGalleryData(owner, repo, path = '', branch = 'main') {
        try {
            // Check cache first
            const cached = checkCache();
            
            // Get latest commit SHA for the path
            const latestSHA = await getLatestCommitSHA(owner, repo, path, branch);
            
            if (cached && cached.sha === latestSHA) {
                console.log('Using cached gallery data');
                return cached.photos;
            }
            
            console.log('Fetching fresh gallery data from GitHub');
            
            // Fetch directory contents
            const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }
            
            const contents = await response.json();
            
            // Filter for image files
            const imageFiles = contents.filter(file => 
                file.type === 'file' && /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name)
            );
            
            // Sort by name (which often includes dates)
            imageFiles.sort((a, b) => a.name.localeCompare(b.name));
            
            // Transform to photo objects
            const photos = imageFiles.map(file => transformToPhotoObject(file, owner, repo, branch));
            
            // Cache the results
            cacheData(photos, latestSHA);
            
            return photos;
            
        } catch (error) {
            console.error('Error fetching gallery data:', error);
            
            // Try to return cached data as fallback
            const cached = checkCache();
            if (cached) {
                console.log('Using cached data as fallback');
                return cached.photos;
            }
            
            // If no cache, throw error to trigger fallback array
            throw error;
        }
    }
    
    /**
     * Gets the latest commit SHA for a path
     * @param {string} owner - GitHub username
     * @param {string} repo - Repository name
     * @param {string} path - Path to check
     * @param {string} branch - Branch name
     * @returns {Promise<string>} Commit SHA
     */
    async function getLatestCommitSHA(owner, repo, path, branch) {
        const commitsUrl = `https://api.github.com/repos/${owner}/${repo}/commits?sha=${branch}&path=${path}&per_page=1`;
        const response = await fetch(commitsUrl);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch commit SHA: ${response.status}`);
        }
        
        const commits = await response.json();
        return commits[0]?.sha || '';
    }
    
    /**
     * Transforms GitHub file object to photo object
     * @param {Object} file - GitHub file object
     * @param {string} owner - GitHub username
     * @param {string} repo - Repository name
     * @param {string} branch - Branch name
     * @returns {Object} Photo object
     */
    function transformToPhotoObject(file, owner, repo, branch) {
        const rawBaseUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}`;
        const fullUrl = `${rawBaseUrl}/${file.name}`;
        
        // Extract title from filename (remove extension and clean up)
        const title = file.name
            .replace(/\.[^/.]+$/, '') // remove extension
            .replace(/[-_]/g, ' ')     // replace hyphens and underscores with spaces
            .replace(/^\d{4}-\d{2}-\d{2}\s*/, '') // remove date prefix if present
            .trim();
        
        // Capitalize first letter of each word
        const formattedTitle = title
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        
        // Try to extract date from filename (YYYY-MM-DD format)
        const dateMatch = file.name.match(/^(\d{4}-\d{2}-\d{2})/);
        const date = dateMatch ? dateMatch[1] : null;
        const dateDisplay = date ? formatDate(date) : null;
        
        return {
            fullImage: fullUrl,
            // For now, srcset points to same image - browser will handle sizing
            // In future, could integrate with image service for multiple sizes
            srcset: `${fullUrl}`,
            src: fullUrl,
            alt: formattedTitle,
            width: 1200, // default dimensions
            height: 800,
            title: formattedTitle,
            date: date,
            dateDisplay: dateDisplay
        };
    }
    
    /**
     * Formats ISO date to readable format
     * @param {string} isoDate - Date in YYYY-MM-DD format
     * @returns {string} Formatted date
     */
    function formatDate(isoDate) {
        const date = new Date(isoDate + 'T00:00:00');
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
    
    /**
     * Checks localStorage for cached data
     * @returns {Object|null} Cached data or null
     */
    function checkCache() {
        try {
            const cachedPhotos = localStorage.getItem(CACHE_KEY);
            const cachedSHA = localStorage.getItem(CACHE_SHA_KEY);
            
            if (cachedPhotos && cachedSHA) {
                return {
                    photos: JSON.parse(cachedPhotos),
                    sha: cachedSHA
                };
            }
        } catch (error) {
            console.warn('Error reading cache:', error);
        }
        return null;
    }
    
    /**
     * Caches photo data in localStorage
     * @param {Array} photos - Photo objects to cache
     * @param {string} sha - Commit SHA
     */
    function cacheData(photos, sha) {
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(photos));
            localStorage.setItem(CACHE_SHA_KEY, sha);
            console.log('Gallery data cached successfully');
        } catch (error) {
            console.warn('Error caching data:', error);
        }
    }
    
    /**
     * Clears the gallery cache
     */
    function clearCache() {
        localStorage.removeItem(CACHE_KEY);
        localStorage.removeItem(CACHE_SHA_KEY);
        console.log('Gallery cache cleared');
    }
    
    // Export to window
    window.GithubGallery = {
        fetchGalleryData,
        clearCache
    };
    
})(window);
