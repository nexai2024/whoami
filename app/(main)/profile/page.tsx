'use client';
import { useUser, useStackApp, UserButton } from "@stackframe/stack";

export default function PageClient() {
  const user = useUser();
  const app = useStackApp();
  return (
    <div>
      {user ? (
        <div>
          <UserButton />
          <p>Welcome, {user.displayName ?? "unnamed user"}</p>
          <p>Your e-mail: {user.primaryEmail}</p>
          <button onClick={() => user.signOut()}>Sign Out</button>
        </div>
      ) : (
        <div>
          <p>You are not logged in</p>
          <button onClick={() => app.redirectToSignIn()}>Sign in</button>
          <button onClick={() => app.redirectToSignUp()}>Sign up</button>
        </div>
      )}
    </div>
  );
}