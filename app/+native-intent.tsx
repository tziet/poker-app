// The Google OAuth redirect (com.yonatantseitlin.pokertracker:///oauthredirect?code=...)
// is handled by expo-auth-session, not by a screen. Stop Expo Router from trying
// to navigate to it (which shows "Unmatched Route").
export function redirectSystemPath({
  path,
}: {
  path: string;
  initial: boolean;
}) {
  if (path.includes('oauthredirect')) {
    return '/';
  }
  return path;
}
