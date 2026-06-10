const {
  ENABLE_HOLIDAY_EFFECTS,
  GITHUB_TOKEN,
  GITHUB_URL,
  RESEND_API_KEY,
  RESEND_FROM_EMAIL,
  CONTACT_EMAIL_TO,
  PUBLIC_SITE_URL,
} = import.meta.env;

export const env = {
  enableHolidayEffects: ENABLE_HOLIDAY_EFFECTS !== "false",
  githubToken: GITHUB_TOKEN ?? "",
  githubUrl: GITHUB_URL ?? "https://api.github.com/graphql",
  resendApiKey: RESEND_API_KEY ?? "",
  resendFromEmail: RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
  contactEmailTo: CONTACT_EMAIL_TO ?? "mikel@mikeldev.com",
  siteUrl: PUBLIC_SITE_URL ?? "https://www.mikeldev.com",
};
