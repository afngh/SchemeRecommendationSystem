import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Protect dashboard, recommend, and top-rated pages.
// Landing page and static resources are kept public.
const isProtectedRoute = createRouteMatcher([
  '/recommend(.*)',
  '/gov/dashboard(.*)',
  '/top-rated(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
