const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

admin.initializeApp();

// Called by the app before sending a password-reset email.
// Rejects when the email belongs to an account that has Google linked, so a
// password can't be added to a Google account via "Forgot password".
exports.checkPasswordResetAllowed = onCall(async (request) => {
  const email = String(request.data?.email ?? '').trim().toLowerCase();
  if (!email) {
    throw new HttpsError('invalid-argument', 'Email is required');
  }

  try {
    const user = await admin.auth().getUserByEmail(email);
    if (user.providerData.some((p) => p.providerId === 'google.com')) {
      throw new HttpsError('failed-precondition', 'google-account');
    }
  } catch (err) {
    if (err instanceof HttpsError) throw err;
    if (err.code === 'auth/user-not-found') return { allowed: true };
    console.error('checkPasswordResetAllowed failed', err);
    throw new HttpsError('internal', 'Could not verify email');
  }

  return { allowed: true };
});
