import { useState } from 'react';
import { PendingAssetTile, PENDING_ASSET, brandPalette } from './mockups/_shared';

const CARD_SHADOW = '0 0 40px rgba(255,255,255,0.03), 0 12px 40px rgba(0,0,0,0.3)';

// ━━━ Exact Instagram SVG Icons (traced from app) ━━━
const IG = {
  heart: <svg width="24" height="24" viewBox="0 0 24 24"><path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-1.816-1.543-4.303-3.752C5.152 14.081 2.5 12.194 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938z" fill="none" stroke="#262626" strokeWidth="2"/></svg>,
  comment: <svg width="24" height="24" viewBox="0 0 24 24"><path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22z" fill="none" stroke="#262626" strokeWidth="2" strokeLinejoin="round"/></svg>,
  share: <svg width="24" height="24" viewBox="0 0 24 24"><line x1="22" y1="3" x2="9.218" y2="10.083" fill="none" stroke="#262626" strokeWidth="2" strokeLinecap="round"/><polygon points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334" fill="none" stroke="#262626" strokeWidth="2" strokeLinejoin="round"/></svg>,
  bookmark: <svg width="24" height="24" viewBox="0 0 24 24"><polygon points="20 21 12 13.44 4 21 4 3 20 3 20 21" fill="none" stroke="#262626" strokeWidth="2" strokeLinejoin="round"/></svg>,
  more: <svg width="24" height="24" viewBox="0 0 24 24"><circle cx="6" cy="12" r="1.5" fill="#262626"/><circle cx="12" cy="12" r="1.5" fill="#262626"/><circle cx="18" cy="12" r="1.5" fill="#262626"/></svg>,
  verified: <svg width="13" height="13" viewBox="0 0 40 40"><path d="M19.998 3.094L14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v6.354h6.234L14.638 40l5.36-3.094L25.358 40l2.972-5.15h6.234v-6.354L40 25.359 36.905 20 40 14.641l-5.436-3.137V5.15h-6.234L25.358 0l-5.36 3.094z" fill="#3897f0"/><path d="M17.204 28.758l-6.903-6.903 2.464-2.464 4.44 4.44 9.573-9.573 2.464 2.464z" fill="#fff"/></svg>,
};

function ProfilePic({ brand, size = 32, hasStory = false }: { brand: string; size?: number; hasStory?: boolean }) {
  const palette = brandPalette(brand);
  const inner = (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: palette.accent,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 600, fontSize: size * 0.38,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    }}>{palette.initial}</div>
  );
  if (!hasStory) return inner;
  return (
    <div style={{
      width: size + 6, height: size + 6, borderRadius: '50%',
      background: 'conic-gradient(from 225deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888, #a020f0, #4c68d7, #4c68d7, #6187d7, #f09433)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 2,
    }}>
      <div style={{ width: size + 2, height: size + 2, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 2 }}>
        {inner}
      </div>
    </div>
  );
}

interface FeedPostProps {
  brand: string;
  handle: string;
  caption: string;
  imgSrc: string | null;
  placeholderText: string;
  location?: string;
  isVerified?: boolean;
}

export function IGFeedPost({ brand, handle, caption, imgSrc, placeholderText, location, isVerified }: FeedPostProps) {
  return (
    <div style={{
      maxWidth: 468, width: '100%', background: '#fff', borderRadius: 3,
      boxShadow: CARD_SHADOW, border: '1px solid #dbdbdb', overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px 8px 10px', gap: 10 }}>
        <ProfilePic brand={brand} size={32} hasStory />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#262626' }}>{handle}</span>
            {isVerified && IG.verified}
          </div>
          {location && <div style={{ fontSize: 12, color: '#262626', fontWeight: 400, lineHeight: 1.2 }}>{location}</div>}
        </div>
        {IG.more}
      </div>
      {/* Image */}
      <div style={{ aspectRatio: '1/1', background: '#efefef', position: 'relative', overflow: 'hidden' }}>
        {imgSrc === PENDING_ASSET ? (
          <PendingAssetTile brand={brand} text={placeholderText} />
        ) : imgSrc ? (
          <img src={imgSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <img src={`https://picsum.photos/seed/${placeholderText.replace(/[^a-zA-Z]/g,'')}${brand}/1080/1080`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
      </div>
      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '6px 12px 0', gap: 16 }}>
        <div style={{ cursor: 'pointer', padding: '8px 0' }}>{IG.heart}</div>
        <div style={{ cursor: 'pointer', padding: '8px 0' }}>{IG.comment}</div>
        <div style={{ cursor: 'pointer', padding: '8px 0' }}>{IG.share}</div>
        <div style={{ flex: 1 }} />
        <div style={{ cursor: 'pointer', padding: '8px 0' }}>{IG.bookmark}</div>
      </div>
      {/* Likes */}
      <div style={{ padding: '0 12px 4px', fontSize: 14, fontWeight: 600, color: '#262626' }}>
        <span style={{ fontWeight: 400, color: '#262626' }}>Liked by </span><span>studio.threads</span><span style={{ fontWeight: 400 }}> and </span><span>127 others</span>
      </div>
      {/* Caption */}
      <div style={{ padding: '0 12px 6px', fontSize: 14, color: '#262626', lineHeight: 1.47 }}>
        <span style={{ fontWeight: 600 }}>{handle}</span>{' '}
        <span>{caption.length > 125 ? caption.slice(0, 125) : caption}</span>
        {caption.length > 125 && <span style={{ color: '#8e8e8e', cursor: 'pointer' }}> ...more</span>}
      </div>
      {/* View comments */}
      <div style={{ padding: '0 12px 4px', fontSize: 14, color: '#8e8e8e' }}>View all 24 comments</div>
      {/* Add comment */}
      <div style={{ padding: '4px 12px 10px', display: 'flex', alignItems: 'center', gap: 8, borderTop: '1px solid #efefef', marginTop: 4 }}>
        <ProfilePic brand={brand} size={20} />
        <span style={{ fontSize: 14, color: '#8e8e8e', flex: 1 }}>Add a comment...</span>
      </div>
    </div>
  );
}

interface CarouselProps {
  brand: string;
  handle: string;
  caption: string;
  slideCount: number;
  placeholderText: string;
  isVerified?: boolean;
  /** When set to PENDING_ASSET, every slide renders the "asset pending" tile instead of Picsum stock. */
  imgSrc?: string | null;
}

export function IGCarousel({ brand, handle, caption, slideCount, placeholderText, isVerified, imgSrc }: CarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = Array.from({ length: slideCount }, (_, i) => i);
  const isPending = imgSrc === PENDING_ASSET;

  return (
    <div style={{
      maxWidth: 468, width: '100%', background: '#fff', borderRadius: 3,
      boxShadow: CARD_SHADOW, border: '1px solid #dbdbdb', overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px 8px 10px', gap: 10 }}>
        <ProfilePic brand={brand} size={32} hasStory />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#262626' }}>{handle}</span>
            {isVerified && IG.verified}
          </div>
        </div>
        {IG.more}
      </div>
      {/* Carousel */}
      <div style={{ position: 'relative', aspectRatio: '1/1', background: '#efefef', overflow: 'hidden' }}>
        <div style={{
          display: 'flex', width: `${slideCount * 100}%`,
          transform: `translateX(-${currentSlide * (100 / slideCount)}%)`,
          transition: 'transform 0.3s ease',
          height: '100%',
        }}>
          {slides.map(i => (
            <div key={i} style={{ width: `${100 / slideCount}%`, height: '100%', flexShrink: 0 }}>
              {isPending ? (
                <PendingAssetTile brand={brand} text={`${placeholderText} · Slide ${i + 1}/${slideCount}`} />
              ) : (
                <img src={`https://picsum.photos/seed/${placeholderText.replace(/[^a-zA-Z]/g,'')}${brand}${i}/1080/1080`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
            </div>
          ))}
        </div>
        {/* Counter badge */}
        <div style={{ position: 'absolute', top: 14, right: 14, padding: '4px 10px', borderRadius: 14, background: 'rgba(26,26,26,0.8)', color: '#fff', fontSize: 12, fontWeight: 500 }}>
          {currentSlide + 1}/{slideCount}
        </div>
        {/* Nav arrows */}
        {currentSlide > 0 && (
          <button onClick={() => setCurrentSlide(s => s - 1)} style={{
            position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
            width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.9)',
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)', fontSize: 14, color: '#262626',
          }}>‹</button>
        )}
        {currentSlide < slideCount - 1 && (
          <button onClick={() => setCurrentSlide(s => s + 1)} style={{
            position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
            width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.9)',
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)', fontSize: 14, color: '#262626',
          }}>›</button>
        )}
      </div>
      {/* Actions + dots */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '6px 12px 0' }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ cursor: 'pointer', padding: '8px 0' }}>{IG.heart}</div>
          <div style={{ cursor: 'pointer', padding: '8px 0' }}>{IG.comment}</div>
          <div style={{ cursor: 'pointer', padding: '8px 0' }}>{IG.share}</div>
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 4 }}>
          {slides.map(i => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: '50%',
              background: i === currentSlide ? '#0095f6' : '#c7c7c7',
              transition: 'background 0.2s',
            }} />
          ))}
        </div>
        <div style={{ cursor: 'pointer', padding: '8px 0' }}>{IG.bookmark}</div>
      </div>
      {/* Likes */}
      <div style={{ padding: '0 12px 4px', fontSize: 14, fontWeight: 600, color: '#262626' }}>87 likes</div>
      {/* Caption */}
      <div style={{ padding: '0 12px 6px', fontSize: 14, color: '#262626', lineHeight: 1.47 }}>
        <span style={{ fontWeight: 600 }}>{handle}</span>{' '}
        {caption.length > 100 ? caption.slice(0, 100) + '...' : caption}
      </div>
      <div style={{ padding: '0 12px 10px', fontSize: 14, color: '#8e8e8e' }}>View all 12 comments</div>
    </div>
  );
}

interface StoriesProps {
  brand: string;
  handle: string;
  imgSrc: string | null;
  placeholderText: string;
}

export function IGStories({ brand, handle, imgSrc, placeholderText }: StoriesProps) {

  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Phone frame */}
      <div style={{
        width: 300, background: '#000', borderRadius: 44,
        padding: '14px 8px', boxShadow: '0 0 0 2px #1a1a1a, 0 0 0 4px #333, ' + CARD_SHADOW,
      }}>
        {/* Dynamic Island */}
        <div style={{ height: 28, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ width: 90, height: 24, background: '#000', borderRadius: 20, border: '1px solid #1a1a1a' }} />
        </div>
        {/* Screen */}
        <div style={{ borderRadius: 32, overflow: 'hidden', position: 'relative', background: '#000' }}>
          <div style={{ aspectRatio: '9/16', position: 'relative' }}>
            {imgSrc === PENDING_ASSET ? (
              <PendingAssetTile brand={brand} text={placeholderText} />
            ) : imgSrc ? (
              <img src={imgSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <img src={`https://picsum.photos/seed/${placeholderText.replace(/[^a-zA-Z]/g,'')}${brand}/1080/1920`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
            {/* Progress bars */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '8px 8px 0', display: 'flex', gap: 3 }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{ flex: 1, height: 2, borderRadius: 1, background: i === 0 ? '#fff' : 'rgba(255,255,255,0.35)', overflow: 'hidden' }}>
                  {i === 0 && <div style={{ width: '60%', height: '100%', background: '#fff', borderRadius: 1 }} />}
                </div>
              ))}
            </div>
            {/* Header */}
            <div style={{ position: 'absolute', top: 14, left: 0, right: 0, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <ProfilePic brand={brand} size={28} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>{handle}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>4h</span>
              <div style={{ flex: 1 }} />
              <svg width="20" height="20" viewBox="0 0 24 24"><circle cx="6" cy="12" r="1.5" fill="#fff"/><circle cx="12" cy="12" r="1.5" fill="#fff"/><circle cx="18" cy="12" r="1.5" fill="#fff"/></svg>
            </div>
            {/* Bottom: reply + share */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 12px', display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(transparent, rgba(0,0,0,0.4))' }}>
              <div style={{ flex: 1, border: '1px solid rgba(255,255,255,0.4)', borderRadius: 24, padding: '8px 14px', fontSize: 14, color: 'rgba(255,255,255,0.6)', fontFamily: '-apple-system, sans-serif' }}>Send message</div>
              <svg width="24" height="24" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="none" stroke="#fff" strokeWidth="2"/></svg>
              <svg width="24" height="24" viewBox="0 0 24 24"><line x1="22" y1="3" x2="9.218" y2="10.083" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"/><polygon points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round"/></svg>
            </div>
          </div>
        </div>
        {/* Home indicator */}
        <div style={{ height: 18, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', paddingBottom: 2 }}>
          <div style={{ width: 120, height: 4, background: '#fff', borderRadius: 2, opacity: 0.5 }} />
        </div>
      </div>
    </div>
  );
}

interface ReelProps {
  brand: string;
  handle: string;
  caption: string;
  duration: string;
  imgSrc: string | null;
  placeholderText: string;
  audioLabel?: string;
}

export function IGReel({ brand, handle, caption, duration, imgSrc, placeholderText, audioLabel }: ReelProps) {

  const brandName = brandPalette(brand).name;
  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        width: 300, background: '#000', borderRadius: 44,
        padding: '14px 8px', boxShadow: '0 0 0 2px #1a1a1a, 0 0 0 4px #333, ' + CARD_SHADOW,
      }}>
        <div style={{ height: 28, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ width: 90, height: 24, background: '#000', borderRadius: 20, border: '1px solid #1a1a1a' }} />
        </div>
        <div style={{ borderRadius: 32, overflow: 'hidden', position: 'relative', background: '#000' }}>
          <div style={{ aspectRatio: '9/16', position: 'relative' }}>
            {imgSrc === PENDING_ASSET ? (
              <PendingAssetTile brand={brand} text={placeholderText} />
            ) : imgSrc ? (
              <img src={imgSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <img src={`https://picsum.photos/seed/${placeholderText.replace(/[^a-zA-Z]/g,'')}${brand}/1080/1920`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
            {/* Play icon center */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 0, height: 0, borderTop: '11px solid transparent', borderBottom: '11px solid transparent', borderLeft: '18px solid #fff', marginLeft: 4 }} />
              </div>
            </div>
            {/* Right sidebar icons */}
            <div style={{ position: 'absolute', right: 10, bottom: 100, display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
              {[
                { icon: <svg width="26" height="26" viewBox="0 0 24 24"><path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-1.816-1.543-4.303-3.752C5.152 14.081 2.5 12.194 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938z" fill="none" stroke="#fff" strokeWidth="2"/></svg>, n: '1,247' },
                { icon: <svg width="26" height="26" viewBox="0 0 24 24"><path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22z" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round"/></svg>, n: '48' },
                { icon: <svg width="26" height="26" viewBox="0 0 24 24"><line x1="22" y1="3" x2="9.218" y2="10.083" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"/><polygon points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round"/></svg>, n: '' },
                { icon: <svg width="22" height="22" viewBox="0 0 24 24"><circle cx="6" cy="12" r="1.5" fill="#fff"/><circle cx="12" cy="12" r="1.5" fill="#fff"/><circle cx="18" cy="12" r="1.5" fill="#fff"/></svg>, n: '' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  {item.icon}
                  {item.n && <span style={{ fontSize: 11, color: '#fff', fontWeight: 600, fontFamily: '-apple-system, sans-serif', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>{item.n}</span>}
                </div>
              ))}
              {/* Audio disc */}
              <div style={{ width: 28, height: 28, borderRadius: 6, border: '2px solid #fff', overflow: 'hidden', marginTop: 4 }}>
                <ProfilePic brand={brand} size={24} />
              </div>
            </div>
            {/* Bottom info */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 50, padding: '40px 12px 14px', background: 'linear-gradient(transparent, rgba(0,0,0,0.5))' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <ProfilePic brand={brand} size={26} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', fontFamily: '-apple-system, sans-serif' }}>{handle}</span>
                <span style={{ fontSize: 12, color: '#fff', padding: '3px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.5)', fontWeight: 600, fontFamily: '-apple-system, sans-serif' }}>Follow</span>
              </div>
              <div style={{ fontSize: 13, color: '#fff', lineHeight: 1.4, fontFamily: '-apple-system, sans-serif', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                {caption.length > 70 ? caption.slice(0, 70) + '... more' : caption}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><circle cx="6" cy="18" r="3"/><circle cx="16" cy="10" r="3"/><path d="M3 18V8a3 3 0 0 1 3-3h2l2.5 3H16a3 3 0 0 1 3 3v2" fill="none" stroke="#fff" strokeWidth="2"/></svg>
                <span style={{ fontSize: 12, color: '#fff', fontFamily: '-apple-system, sans-serif' }}>{audioLabel || `${brandName} · Original audio`}</span>
              </div>
            </div>
            {/* Duration */}
            <div style={{ position: 'absolute', bottom: 6, right: 6, padding: '1px 5px', borderRadius: 3, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>{duration}</div>
          </div>
        </div>
        <div style={{ height: 18, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', paddingBottom: 2 }}>
          <div style={{ width: 120, height: 4, background: '#fff', borderRadius: 2, opacity: 0.5 }} />
        </div>
      </div>
    </div>
  );
}

// ━━━ TikTok ━━━

interface TikTokProps {
  brand: string;
  handle: string;
  caption: string;
  duration: string;
  imgSrc: string | null;
  placeholderText: string;
  soundName?: string;
}

export function TikTokPost({ brand, handle, caption, duration, imgSrc, placeholderText, soundName }: TikTokProps) {

  const brandName = brandPalette(brand).name;

  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        width: 300, background: '#000', borderRadius: 44,
        padding: '14px 8px', boxShadow: '0 0 0 2px #1a1a1a, 0 0 0 4px #333, ' + CARD_SHADOW,
      }}>
        <div style={{ height: 28, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ width: 90, height: 24, background: '#000', borderRadius: 20, border: '1px solid #1a1a1a' }} />
        </div>
        <div style={{ borderRadius: 32, overflow: 'hidden', position: 'relative', background: '#161823' }}>
          <div style={{ aspectRatio: '9/16', position: 'relative' }}>
            {imgSrc === PENDING_ASSET ? (
              <PendingAssetTile brand={brand} text={placeholderText} />
            ) : imgSrc ? (
              <img src={imgSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <img src={`https://picsum.photos/seed/${placeholderText.replace(/[^a-zA-Z]/g,'')}${brand}/1080/1920`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
            {/* TikTok header tabs */}
            <div style={{ position: 'absolute', top: 10, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 16, alignItems: 'center' }}>
              <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontFamily: '-apple-system, sans-serif' }}>Following</span>
              <span style={{ fontSize: 16, color: '#fff', fontWeight: 700, fontFamily: '-apple-system, sans-serif', borderBottom: '2px solid #fff', paddingBottom: 2 }}>For You</span>
            </div>
            {/* Play */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 0, height: 0, borderTop: '11px solid transparent', borderBottom: '11px solid transparent', borderLeft: '18px solid rgba(255,255,255,0.8)', marginLeft: 4 }} />
              </div>
            </div>
            {/* Right sidebar */}
            <div style={{ position: 'absolute', right: 8, bottom: 80, display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <ProfilePic brand={brand} size={40} />
                <div style={{ position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)', width: 18, height: 18, borderRadius: '50%', background: '#fe2c55', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff', fontWeight: 700, border: '2px solid #161823' }}>+</div>
              </div>
              {[
                { icon: <svg width="28" height="28" viewBox="0 0 24 24"><path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-1.816-1.543-4.303-3.752C5.152 14.081 2.5 12.194 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938z" fill="#fff"/></svg>, n: '8.4K' },
                { icon: <svg width="28" height="28" viewBox="0 0 24 24"><path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22z" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round"/></svg>, n: '342' },
                { icon: <svg width="28" height="28" viewBox="0 0 24 24"><polygon points="20 21 12 13.44 4 21 4 3 20 3 20 21" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round"/></svg>, n: '1.2K' },
                { icon: <svg width="28" height="28" viewBox="0 0 24 24"><line x1="22" y1="3" x2="9.218" y2="10.083" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" fill="none"/><polygon points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round"/></svg>, n: '' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  {item.icon}
                  {item.n && <span style={{ fontSize: 11, color: '#fff', fontWeight: 500, fontFamily: '-apple-system, sans-serif' }}>{item.n}</span>}
                </div>
              ))}
              <div style={{ width: 36, height: 36, borderRadius: '50%', border: '8px solid #161823', background: '#000', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ProfilePic brand={brand} size={20} />
              </div>
            </div>
            {/* Bottom info */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 56, padding: '40px 12px 14px', background: 'linear-gradient(transparent, rgba(0,0,0,0.4))' }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: '-apple-system, sans-serif' }}>@{handle}</span>
              <div style={{ fontSize: 13, color: '#fff', lineHeight: 1.4, fontFamily: '-apple-system, sans-serif', marginTop: 6 }}>
                {caption.length > 80 ? caption.slice(0, 80) + '...' : caption}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><circle cx="6" cy="18" r="3"/><circle cx="16" cy="10" r="3"/><path d="M3 18V8a3 3 0 0 1 3-3h2l2.5 3H16a3 3 0 0 1 3 3v2" fill="none" stroke="#fff" strokeWidth="2"/></svg>
                <span style={{ fontSize: 12, color: '#fff', fontFamily: '-apple-system, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {soundName || `${brandName} · original sound - ${handle}`}
                </span>
              </div>
            </div>
            <div style={{ position: 'absolute', bottom: 6, right: 6, padding: '1px 5px', borderRadius: 3, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>{duration}</div>
          </div>
        </div>
        {/* TikTok bottom nav */}
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '8px 0 2px' }}>
          {['Home', '', 'Inbox', 'Profile'].map((label, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              {i === 1 ? (
                <div style={{ width: 38, height: 24, borderRadius: 6, background: 'linear-gradient(90deg, #25f4ee, #fe2c55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 24, height: 20, borderRadius: 4, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700 }}>+</div>
                </div>
              ) : (
                <div style={{ width: 22, height: 22 }} />
              )}
              {label && <span style={{ fontSize: 9, color: i === 0 ? '#fff' : 'rgba(255,255,255,0.4)', fontFamily: '-apple-system, sans-serif' }}>{label}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
