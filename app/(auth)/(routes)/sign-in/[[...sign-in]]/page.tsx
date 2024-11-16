"use client"
import { SignIn } from '@clerk/nextjs'
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If the user is signed in, redirect to the dashboard or home page
    if (isSignedIn) {
      router.push('/dashboard'); // Change '/dashboard' to your desired route
    }
  }, [isSignedIn, router]);

  if (isSignedIn) {
    return null; // You can also show a loader here while redirecting
  }
  return <SignIn />
}