// Assets configuration
const ASSETS_CONFIG = {
  // Set to true to use external assets repository, false for local assets
  // useExternalAssets: import.meta.env.PROD,
  // Uncomment the line below to test external assets in development:
  useExternalAssets: true,
  
  // External assets base URL (your separate GitHub Pages repo)
  externalAssetsBaseUrl: "https://astoyanov2231.github.io/InteractivePuzzle-Assets",
  
  // Local assets base URL (for development)
  localAssetsBaseUrl: "",
};

/**
 * Get the full URL for an asset
 * @param assetPath - The relative path to the asset (e.g., "images/categories/brain.png")
 * @returns The full URL to the asset
 */
export const getAssetUrl = (assetPath: string): string => {
  // Remove leading slash if present
  const cleanPath = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;
  
  if (ASSETS_CONFIG.useExternalAssets) {
    return `${ASSETS_CONFIG.externalAssetsBaseUrl}/${cleanPath}`;
  }
  
  return `${ASSETS_CONFIG.localAssetsBaseUrl}/assets/${cleanPath}`;
};

/**
 * Get URL for category images
 * @param filename - The image filename (e.g., "brain.png")
 * @returns The full URL to the category image
 */
export const getCategoryImageUrl = (filename: string): string => {
  return getAssetUrl(`images/categories/${filename}`);
};

/**
 * Get URL for competitive game images
 * @param filename - The image filename (e.g., "switch-green.png")
 * @returns The full URL to the competitive game image
 */
export const getCompetitiveImageUrl = (filename: string): string => {
  return getAssetUrl(`images/categories/competitive/${filename}`);
};

export default ASSETS_CONFIG; 