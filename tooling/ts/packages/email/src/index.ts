/**
 * `@suluk/email` — the missing EmailProvider binding + a per-event/per-locale branded template set. The app RENDERS
 * a message (pure, branded, localized via @suluk/i18n) and SENDS it through a swappable provider (consoleProvider in
 * dev; a Workers-safe resendProvider in prod). Never a hosted mailer — the provider is a thin binding (the
 * `@suluk/builder` `email` slot impl). CANDIDATE tooling.
 */
export {
  consoleProvider, resendProvider, storeProvider, pickProvider,
  type EmailProvider, type EmailMessage, type SendResult,
  type ConsoleProviderOptions, type ResendProviderOptions,
  type MailboxSink, type StoredEmail,
} from "./provider";
export {
  renderEmailHtml, DEFAULT_EMAIL_STRINGS,
  type EmailBrand, type BrandedEmailOptions, type RenderContext,
} from "./render";
export {
  verifyEmail, resetPasswordEmail, changeEmailEmail, deleteAccountEmail,
  orderConfirmationEmail, orderStatusEmail, newsletterEmail,
  TEMPLATE_STRINGS, type TemplateContext, type OrderLine,
} from "./templates";
// audience-sync (Phase 3): mirror the MARKETING module's Newsletter rows to an email-provider audience/list.
export {
  consoleAudience, resendAudience, syncNewsletter,
  type AudienceProvider, type AudienceContact, type AudienceResult,
  type ConsoleAudienceOptions, type ResendAudienceOptions, type NewsletterRow, type SyncResult,
} from "./audience";
// Resend FEE weights — the cost of sending email, for the token weight table (~400 µ$/email). Merge RESEND_WEIGHTS into
// the app's table (see @suluk/cost mergeWeights) so a route's `infra: { "resend.email": 1 }` prices the send.
export { RESEND_WEIGHTS, RESEND_EMAIL_MICRO_USD } from "./weights";
