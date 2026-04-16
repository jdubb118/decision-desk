import { IGFeedPost, IGCarousel, IGStories, IGReel, TikTokPost } from './InstagramMockup';
import { FBFeedPost } from './mockups/FBFeedPost';
import { LinkedInPost } from './mockups/LinkedInPost';
import { YouTubePreview } from './mockups/YouTubePreview';
import { SMSPreview } from './mockups/SMSPreview';
import { HomepageHero } from './mockups/HomepageHero';
import { EmailInboxPreview } from './mockups/EmailInboxPreview';
import { adaptCalendarEntry, type CalendarEntryLike } from './mockups/adaptCalendarEntry';

export type CalendarMockupEntry = CalendarEntryLike;

/**
 * Router that picks the right social/email mockup component for a calendar entry
 * and feeds it adapter-derived props. All unsupported combos render a tasteful
 * placeholder card with a hint about what component would need to be built.
 */
export default function CalendarMockup({ entry }: { entry: CalendarMockupEntry }) {
  const a = adaptCalendarEntry(entry);
  const channel = entry.channel?.toLowerCase() || '';
  const sub = (entry.sub_channel || '').toLowerCase().trim();

  // ──────────────────────────────────────────────────────────
  // INSTAGRAM
  // ──────────────────────────────────────────────────────────
  if (channel === 'instagram') {
    if (sub === 'reel') {
      return (
        <IGReel
          brand={a.brand}
          handle={a.handle}
          caption={a.caption}
          duration={a.duration}
          imgSrc={a.imgSrc}
          placeholderText={a.placeholderText}
        />
      );
    }
    if (sub === 'story' || sub === 'stories') {
      return (
        <IGStories
          brand={a.brand}
          handle={a.handle}
          imgSrc={a.imgSrc}
          placeholderText={a.placeholderText}
        />
      );
    }
    if (sub === 'carousel') {
      return (
        <IGCarousel
          brand={a.brand}
          handle={a.handle}
          caption={a.caption}
          slideCount={a.slideCount}
          placeholderText={a.placeholderText}
          isVerified
          imgSrc={a.imgSrc}
        />
      );
    }
    // feed-single or unknown → feed post
    return (
      <IGFeedPost
        brand={a.brand}
        handle={a.handle}
        caption={a.caption}
        imgSrc={a.imgSrc}
        placeholderText={a.placeholderText}
        isVerified
      />
    );
  }

  // ──────────────────────────────────────────────────────────
  // STORIES (EB-only channel that routes through IGStories)
  // ──────────────────────────────────────────────────────────
  if (channel === 'stories') {
    return (
      <IGStories
        brand={a.brand}
        handle={a.handle}
        imgSrc={a.imgSrc}
        placeholderText={a.placeholderText}
      />
    );
  }

  // ──────────────────────────────────────────────────────────
  // FACEBOOK (organic — NOT sponsored)
  // ──────────────────────────────────────────────────────────
  if (channel === 'facebook') {
    const variant: 'image' | 'reel' | 'carousel' | 'link' =
      sub === 'reel'
        ? 'reel'
        : sub === 'carousel'
        ? 'carousel'
        : sub === 'link-post'
        ? 'link'
        : 'image';
    return (
      <FBFeedPost
        brand={a.brand}
        caption={a.caption}
        imgSrc={a.imgSrc}
        placeholderText={a.placeholderText}
        variant={variant}
      />
    );
  }

  // ──────────────────────────────────────────────────────────
  // TIKTOK
  // ──────────────────────────────────────────────────────────
  if (channel === 'tiktok') {
    return (
      <TikTokPost
        brand={a.brand}
        handle={a.handle}
        caption={a.caption}
        duration={a.duration}
        imgSrc={a.imgSrc}
        placeholderText={a.placeholderText}
      />
    );
  }

  // ──────────────────────────────────────────────────────────
  // YOUTUBE
  // ──────────────────────────────────────────────────────────
  if (channel === 'youtube') {
    const title = entry.concept || entry.campaign_name || 'Untitled';
    const description = a.caption;
    return (
      <YouTubePreview
        brand={a.brand}
        title={title}
        description={description}
        imgSrc={a.imgSrc}
        placeholderText={a.placeholderText}
        duration={a.duration !== '0:30' ? a.duration : sub === 'short' ? '0:45' : '3:45'}
        subChannel={sub}
      />
    );
  }

  // ──────────────────────────────────────────────────────────
  // EMAIL
  // ──────────────────────────────────────────────────────────
  if (channel === 'email') {
    const subject = entry.concept || entry.campaign_name || 'Untitled';
    const previewText = entry.why_hook || entry.copy_direction || '';
    return (
      <EmailInboxPreview
        brand={a.brand}
        subject={subject}
        previewText={previewText}
        finalCopyHtml={entry.final_copy}
        copyDirection={entry.copy_direction}
        heroImgSrc={a.imgSrc}
        heroPlaceholder={a.placeholderText}
        concept={entry.concept || undefined}
      />
    );
  }

  // ──────────────────────────────────────────────────────────
  // LINKEDIN
  // ──────────────────────────────────────────────────────────
  if (channel === 'linkedin' || channel === 'linkedin-founder') {
    const isFounder =
      channel === 'linkedin-founder' ||
      sub === 'founder-post' ||
      sub.includes('founder');
    // Map sub_channel to our component's expected value
    let mappedSub: 'company-post' | 'founder-post' | 'text post' | 'document' | 'carousel' | undefined;
    if (sub === 'founder-post') mappedSub = 'founder-post';
    else if (sub === 'company-post') mappedSub = 'company-post';
    else if (sub === 'text post' || sub === 'text-post') mappedSub = 'text post';
    else if (sub === 'document' || sub === 'document/carousel' || sub === 'carousel') mappedSub = 'document';
    return (
      <LinkedInPost
        brand={a.brand}
        caption={a.caption}
        imgSrc={a.imgSrc}
        placeholderText={a.placeholderText}
        isFounder={isFounder}
        subChannel={mappedSub}
      />
    );
  }

  // ──────────────────────────────────────────────────────────
  // SMS
  // ──────────────────────────────────────────────────────────
  if (channel === 'sms') {
    // SMS messages should be short — prefer copy_direction or final_copy verbatim
    const message =
      (entry.final_copy?.trim() || entry.copy_direction?.trim() || entry.concept || '').replace(
        /^["']|["']$/g,
        '',
      );
    return <SMSPreview brand={a.brand} message={message} />;
  }

  // ──────────────────────────────────────────────────────────
  // HOMEPAGE
  // ──────────────────────────────────────────────────────────
  if (channel === 'homepage') {
    const headline = entry.concept || entry.campaign_name || 'New arrivals';
    const subheadline = entry.why_hook || entry.copy_direction || undefined;
    return (
      <HomepageHero
        brand={a.brand}
        headline={headline}
        subheadline={subheadline || undefined}
        imgSrc={a.imgSrc}
        placeholderText={a.placeholderText}
      />
    );
  }

  // ──────────────────────────────────────────────────────────
  // FALLBACK — unsupported combo
  // ──────────────────────────────────────────────────────────
  return <NoMockupPlaceholder channel={channel} subChannel={sub} />;
}

function NoMockupPlaceholder({ channel, subChannel }: { channel: string; subChannel: string }) {
  return (
    <div
      style={{
        maxWidth: 420,
        width: '100%',
        padding: '32px 24px',
        borderRadius: 12,
        background: 'rgba(255,255,255,0.03)',
        border: '1px dashed rgba(255,255,255,0.12)',
        textAlign: 'center',
        color: 'rgba(255,255,255,0.55)',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          margin: '0 auto 14px',
        }}
      >
        🧩
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 6 }}>
        No mockup yet
      </div>
      <div style={{ fontSize: 12, marginBottom: 10 }}>
        <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 3 }}>
          {channel || 'unknown'}/{subChannel || 'default'}
        </code>
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.55 }}>
        Add a component in{' '}
        <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>
          src/components/mockups/
        </code>
        <br />
        and wire it into{' '}
        <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>
          CalendarMockup.tsx
        </code>
        .
      </div>
    </div>
  );
}
