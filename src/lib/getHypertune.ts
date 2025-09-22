import { VercelEdgeConfigInitDataProvider } from "hypertune";
import { createClient } from "@vercel/edge-config";
import { createSource } from "../../generated/hypertune";

const hypertuneSource = createSource({
  token: import.meta.env.VITE_HYPERTUNE_TOKEN!,
  initDataProvider:
    import.meta.env.VITE_EXPERIMENTATION_CONFIG &&
    import.meta.env.VITE_EXPERIMENTATION_CONFIG_ITEM_KEY
      ? new VercelEdgeConfigInitDataProvider({
          edgeConfigClient: createClient(
            import.meta.env.VITE_EXPERIMENTATION_CONFIG,
          ),
          itemKey: import.meta.env.VITE_EXPERIMENTATION_CONFIG_ITEM_KEY,
        })
      : undefined,
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