import passport from "passport";
import { Profile, Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/userModel.js";

const hasGoogleConfig = (): boolean => {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CALLBACK_URL
  );
};

const readGoogleEmail = (profile: Profile): string => {
  const email = profile.emails?.[0]?.value?.trim().toLowerCase() || "";

  if (!email) {
    throw new Error("Google account email not available");
  }

  return email;
};

export const configurePassport = (): boolean => {
  if (!hasGoogleConfig()) {
    console.warn("Google OAuth is disabled: set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL");
    return false;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = readGoogleEmail(profile);
          const providerId = profile.id;
          const displayName = profile.displayName || email;
          const avatarUrl = profile.photos?.[0]?.value;

          let user = await User.findOne({ providerId });

          if (!user) {
            user = await User.findOne({ email });
          }

          if (!user) {
            user = await User.create({
              email,
              provider: "google",
              providerId,
              displayName,
              avatarUrl,
            });
          } else {
            let hasChanges = false;

            if (!user.providerId) {
              user.providerId = providerId;
              hasChanges = true;
            }

            if (!user.displayName && displayName) {
              user.displayName = displayName;
              hasChanges = true;
            }

            if (!user.avatarUrl && avatarUrl) {
              user.avatarUrl = avatarUrl;
              hasChanges = true;
            }

            if (user.provider !== "google") {
              user.provider = "google";
              hasChanges = true;
            }

            if (hasChanges) {
              await user.save();
            }
          }

          done(null, user);
        } catch (error) {
          done(error as Error);
        }
      }
    )
  );

  return true;
};
