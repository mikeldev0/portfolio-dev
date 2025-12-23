const {
  VITE_ENABLE_HOLIDAY_EFFECTS,
  GITHUB_TOKEN,
  GITHUB_URL,
} = import.meta.env;

export const env = {
  enableHolidayEffects: VITE_ENABLE_HOLIDAY_EFFECTS !== "false",
  githubToken: GITHUB_TOKEN,
  githubUrl: GITHUB_URL,
};
