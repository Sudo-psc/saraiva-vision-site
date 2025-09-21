import { Identify } from "flags";
import { dedupe, flag } from "flags/next";
import { createHypertuneAdapter } from "@flags-sdk/hypertune";
import {
  createSource,
  flagFallbacks,
  vercelFlagDefinitions as flagDefinitions,
  Context,
  FlagValues as RootFlagValues,
} from "./generated/hypertune";

const identify: Identify<Context> = dedupe(
  async ({ headers, cookies }) => {
    return {
      environment: process.env.NODE_ENV as any,
      user: { id: "1", name: "Test User", email: "hi@test.com" },
    };
  },
);

const hypertuneAdapter = createHypertuneAdapter<
  RootFlagValues,
  Context
>({
  createSource,
  flagFallbacks,
  flagDefinitions,
  identify,
});

// Placeholder flags - update these after creating flags in Hypertune UI
// export const exampleFlagFlag = flag(
//   hypertuneAdapter.declarations.exampleFlag,
// );

// export const enableDesignV2Flag = flag(
//   hypertuneAdapter.declarations.enableDesignV2,
// );

// Example of how to add flags after creating them in Hypertune:
// 1. Create flags in Hypertune UI (e.g., "exampleFlag", "enableDesignV2")
// 2. Update hypertune.graphql to include the new flags
// 3. Run `npx hypertune` to regenerate types
// 4. Uncomment and use the flags below

export { hypertuneAdapter };