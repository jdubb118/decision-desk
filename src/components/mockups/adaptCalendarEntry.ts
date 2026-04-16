import { PENDING_ASSET, brandPalette } from './_shared';

export interface CalendarEntryLike {
  id: string;
  brand: string;
  date: string;
  channel: string;
  sub_channel: string | null;
  concept: string | null;
  why_hook: string | null;
  copy_direction: string | null;
  final_copy: string | null;
  asset_json: string | null;
  product_json: string | null;
  campaign_name: string | null;
  notes: string | null;
}

interface AssetShape {
  type?: string;
  marketingFolder?: string | null;
  marketingFile?: string | null;
  productImageUrl?: string | null;
  videoClip?: { duration?: string; url?: string } | string | null;
  slideCount?: number;
  notes?: string | null;
}

interface ProductShape {
  name?: string | null;
  sku?: string | null;
  price?: number | null;
  units?: number | null;
  imageUrl?: string | null;
  stockTier?: string | null;
}

export interface AdaptedEntry {
  brand: string;
  handle: string;
  caption: string;
  /** Use PENDING_ASSET sentinel when no real asset exists. */
  imgSrc: string | null;
  placeholderText: string;
  slideCount: number;
  duration: string;
  asset: AssetShape;
  product: ProductShape;
  /** True when `final_copy` is missing (most entries — 99%+). */
  isDraftCopy: boolean;
  /** True when no image asset is available at all. */
  isAssetPending: boolean;
  /** True when copy is entirely absent (neither final_copy nor copy_direction). */
  isCopyMissing: boolean;
}

function safeJson<T>(raw: string | null): T {
  if (!raw) return {} as T;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return {} as T;
  }
}

function looksLikeUrl(s: string | null | undefined): boolean {
  if (!s) return false;
  return /^https?:\/\//i.test(s) || s.startsWith('/');
}

function resolveImgSrc(asset: AssetShape, product: ProductShape): string | null {
  // Priority: product image (Shopify CDN) > asset productImageUrl > asset marketingFile (if absolute URL)
  if (looksLikeUrl(product.imageUrl)) return product.imageUrl!;
  if (looksLikeUrl(asset.productImageUrl)) return asset.productImageUrl!;
  if (looksLikeUrl(asset.marketingFile)) return asset.marketingFile!;
  return null;
}

function resolveDuration(asset: AssetShape): string {
  const vc = asset.videoClip;
  if (vc && typeof vc === 'object' && vc.duration) return vc.duration;
  return '0:30';
}

function conceptSnippet(entry: CalendarEntryLike): string {
  return (entry.concept || entry.why_hook || entry.campaign_name || entry.id).slice(0, 40);
}

export function adaptCalendarEntry(entry: CalendarEntryLike): AdaptedEntry {
  const asset = safeJson<AssetShape>(entry.asset_json);
  const product = safeJson<ProductShape>(entry.product_json);

  const realImgSrc = resolveImgSrc(asset, product);
  const isAssetPending = realImgSrc === null;
  const imgSrc = realImgSrc ?? PENDING_ASSET;

  const finalCopy = entry.final_copy?.trim() || '';
  const copyDirection = entry.copy_direction?.trim() || '';
  const concept = entry.concept?.trim() || '';

  const caption = finalCopy || copyDirection || concept || '';
  const isDraftCopy = !finalCopy;
  const isCopyMissing = !finalCopy && !copyDirection;

  const handle = brandPalette(entry.brand).handle;

  return {
    brand: entry.brand,
    handle,
    caption,
    imgSrc,
    placeholderText: conceptSnippet(entry),
    slideCount: Math.max(2, Math.min(10, asset.slideCount || 4)),
    duration: resolveDuration(asset),
    asset,
    product,
    isDraftCopy,
    isAssetPending,
    isCopyMissing,
  };
}
