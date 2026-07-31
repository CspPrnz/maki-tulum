import { describe, expect, it } from 'vitest';
import { SUPPORTED_LOCALES } from '@maki/i18n';
import { GUIDE_TOPICS, getGuideTopic, listGuideTopics } from './guide';

describe('guide content', () => {
  it('lists a stable, non-empty set of topics', () => {
    expect(listGuideTopics().length).toBeGreaterThan(0);
  });

  it('has unique slugs', () => {
    const slugs = GUIDE_TOPICS.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('exposes exactly one live topic today: cenotes-near-maki', () => {
    const live = GUIDE_TOPICS.filter((t) => t.status === 'live');
    expect(live.map((t) => t.slug)).toEqual(['cenotes-near-maki']);
  });

  it('every topic has title and teaser text in every supported locale', () => {
    for (const topic of GUIDE_TOPICS) {
      for (const locale of SUPPORTED_LOCALES) {
        expect(topic.title[locale], `${topic.slug} title missing ${locale}`).toMatch(/.+/);
        expect(topic.teaser[locale], `${topic.slug} teaser missing ${locale}`).toMatch(/.+/);
      }
    }
  });

  it('every slug is English-word, hyphen-separated (route slug convention)', () => {
    for (const topic of GUIDE_TOPICS) {
      expect(topic.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it('getGuideTopic returns undefined for unknown slugs', () => {
    expect(getGuideTopic('not-a-topic')).toBeUndefined();
  });

  it('getGuideTopic returns the right topic by slug', () => {
    expect(getGuideTopic('cenotes-near-maki')?.status).toBe('live');
  });
});
