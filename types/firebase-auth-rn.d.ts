// firebase/auth's type entry always resolves to the web typings, which omit the
// React Native-only export below. At runtime Metro resolves the React Native
// build of @firebase/auth, which does export it.
import type { Persistence } from "firebase/auth";

declare module "firebase/auth" {
  interface ReactNativeAsyncStorage {
    setItem(key: string, value: string): Promise<void>;
    getItem(key: string): Promise<string | null>;
    removeItem(key: string): Promise<void>;
  }

  export function getReactNativePersistence(
    storage: ReactNativeAsyncStorage,
  ): Persistence;
}
