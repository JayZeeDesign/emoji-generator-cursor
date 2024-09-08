import { SignUp } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <SignUp
        signInUrl="/sign-in"
      />
    </div>
  );
}