import { createSource } from "../../../generated/hypertune";

const hypertuneSource = createSource({
  token: import.meta.env.VITE_HYPERTUNE_TOKEN!,
  // Vercel Edge Config removed for VPS deployment
  // Local fallback or Redis-based configuration can be added here if needed
});

export default async function getHypertune() {
  await hypertuneSource.initIfNeeded(); // Check for flag updates

  return hypertuneSource.root({
    args: {
      context: {
        environment: import.meta.env.MODE as any,
        // Pass current user details here
        user: { id: "1", name: "Test", email: "test@example.com" },
      },
    },
  });
}