import { createSource } from "../../generated/hypertune";

const hypertuneSource = createSource({
  token: process.env.NEXT_PUBLIC_HYPERTUNE_TOKEN!,
  // Vercel Edge Config removed for VPS deployment
  // Local fallback or Redis-based configuration can be added here if needed
});

export default async function getHypertune() {
  await hypertuneSource.initIfNeeded(); // Check for flag updates

  return hypertuneSource.root({
    args: {
      context: {
        environment: process.env.NODE_ENV as any,
        // Pass current user details here
        user: { id: "1", name: "Test", email: "test@example.com" },
      },
    },
  });
}