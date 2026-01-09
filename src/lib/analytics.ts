import { track } from '@vercel/analytics';

// Custom event tracking for key conversion points
export const analytics = {
  // Landing page events
  pageView: (page: string) => {
    track('page_view', { page });
  },

  // File upload funnel
  uploadStarted: () => {
    track('upload_started');
  },

  uploadCompleted: (pageCount: number, filename: string) => {
    track('upload_completed', { pageCount, filename });
  },

  uploadFailed: (error: string) => {
    track('upload_failed', { error });
  },

  // Pricing selection
  pricingSelected: (type: 'single' | 'semester') => {
    track('pricing_selected', { type, price: type === 'single' ? 3 : 8 });
  },

  // Checkout funnel
  checkoutStarted: (type: 'single' | 'semester', email: string) => {
    track('checkout_started', {
      type,
      price: type === 'single' ? 3 : 8,
      hasEmail: !!email
    });
  },

  checkoutCompleted: (type: 'single' | 'semester') => {
    track('checkout_completed', { type, price: type === 'single' ? 3 : 8 });
  },

  checkoutAbandoned: () => {
    track('checkout_abandoned');
  },

  // Guide generation
  guideGenerationStarted: () => {
    track('guide_generation_started');
  },

  guideGenerationCompleted: (courseCode: string, durationMs: number) => {
    track('guide_generation_completed', { courseCode, durationMs });
  },

  guideGenerationFailed: (error: string) => {
    track('guide_generation_failed', { error });
  },

  // Feature usage
  calendarExported: (eventCount: number) => {
    track('calendar_exported', { eventCount });
  },

  gradesExported: () => {
    track('grades_exported');
  },

  tabViewed: (tab: string) => {
    track('tab_viewed', { tab });
  },

  flashcardViewed: () => {
    track('flashcard_viewed');
  },

  // Preview mode
  previewViewed: () => {
    track('preview_viewed');
  },

  // Email capture (for conversion tracking)
  emailCaptured: (source: 'checkout' | 'newsletter') => {
    track('email_captured', { source });
  },
};
