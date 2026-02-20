import siteData from './site-data.json';

export interface SiteStat {
  value: string;
  label: string;
}

export interface ImagePlaceholder {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
}

export interface SiteData {
  stats: SiteStat[];
  images: ImagePlaceholder[];
}

// Function to get all site data
export function getSiteData(): SiteData {
    return siteData as SiteData;
};

// Functions to get specific parts of the data
export function getStats(): SiteStat[] {
    return siteData.stats;
}

export function getImages(): ImagePlaceholder[] {
    return siteData.images;
}

export function getImageById(id: string): ImagePlaceholder | undefined {
    return siteData.images.find(p => p.id === id);
}
