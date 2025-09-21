import { VercelEdgeConfigInitDataProvider } from "hypertune";
import { createClient } from "@vercel/edge-config";
import { createSource } from "../../generated/hypertune";

const hypertuneSource = createSource({
  token: process.env.VITE_HYPERTUNE_TOKEN!,
  initDataProvider:
    process.env.EXPERIMENTATION_CONFIG &&
    process.env.EXPERIMENTATION_CONFIG_ITEM_KEY
      ? new VercelEdgeConfigInitDataProvider({
          edgeConfigClient: createClient(
            process.env.EXPERIMENTATION_CONFIG,
          ),
          itemKey: process.env.EXPERIMENTATION_CONFIG_ITEM_KEY,
        })
      : undefined,
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