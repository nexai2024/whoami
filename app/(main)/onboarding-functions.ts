//import { stackServerApp } from '@/stack/server';
import { redirect } from 'next/navigation';
/**
 * Ensures that the current user has completed onboarding.
 * If not, redirects the user to the onboarding page.
 */
export async function ensureOnboarded() {
  const user = null;
  // try {
  //  // user = await stackServerApp.getUser();
  // } catch (error) {
  //   // Optionally log the error
  //   user = null;
  // }
  // let redirectPath = '/dashboard';
  // try {
  //   if (
  //     // !user ||
  //     // !user.clientReadOnlyMetadata ||
  //     // !user.clientReadOnlyMetadata.onboardingComplete
  //   ) {
  //     redirectPath = '/onboarding';
  //   }
  // } catch (error) {
  //   console.error('Error checking onboarding status:', error);
  //   redirectPath = '/onboarding';
  // } finally {
  //   redirect(redirectPath);
  // }
}
export async function initOnboardingUser() {
  //const user = await stackServerApp.getUser();
  // if (user && !user.clientReadOnlyMetadata.onboardingComplete) {
  //   await user.update({
  //     clientReadOnlyMetadata: {
  //       subscriptionPlan: "free",
  //       subdomain: "",
  //       onboardingComplete: false,
  //     },
  //   });
  // }
}

export async function onboardingComplete() {
  //const user = await stackServerApp.getUser();
  // if (user && !user.clientReadOnlyMetadata.onboardingComplete) {
  //   await user.update({
  //     clientReadOnlyMetadata: {
  //       onboardingComplete: true,
  //     },
  //   });
  // }
}