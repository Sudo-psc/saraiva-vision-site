/* eslint-disable */

import * as sdk from "hypertune";

export const queryCode = `query FullQuery{root}`;

export const query: sdk.Query<sdk.ObjectValueWithVariables> = {"variableDefinitions":{},"fragmentDefinitions":{},"fieldQuery":{"Query":{"type":"InlineFragment","objectTypeName":"Query","selection":{"root":{"fieldArguments":{"__isPartialObject__":true},"fieldQuery":{}}}}}};

export const vercelFlagDefinitions = {};

export type FlagValues = {
  
}

export type FlagPath = keyof FlagValues & string;

export const flagFallbacks: FlagValues = {
  
}

export function decodeFlagValues<TFlagPath extends keyof FlagValues & string>(
  encodedFlagValues: string,
  flagPaths: TFlagPath[]
): Pick<FlagValues, TFlagPath> {
  return sdk.decodeFlagValues({ encodedFlagValues, flagPaths })
}

export type VariableValues = {};

export type User = {
  id: string;
  name: string;
  email: string;
}

export const EnvironmentEnumValues = [
  "development",
  "production",
  "test"
] as const;
export type Environment = typeof EnvironmentEnumValues[number];

/**
 * This `Context` input type is used for the `context` argument on your root field.
 * It contains details of the current `user` and `environment`.
 * 
 * You can define other custom input types with fields that are primitives, enums 
 * or other input types.
 */
export type Context = {
  user: User;
  environment: Environment;
}

export type RootArgs = {
  context: Context;
}

export class RootNode extends sdk.Node {
  override typeName = "Root" as const;

  getRootArgs(): RootArgs {
    const { step } = this.props;
    return (step?.type === 'GetFieldStep' ? step.fieldArguments : {}) as RootArgs;
  }


}

/**
 * This is your project schema expressed in GraphQL.
 * 
 * Define `Boolean` fields for feature flags, custom `enum` fields for flags with 
 * more than two states, `Int` fields for numeric flags like timeouts and limits, 
 * `String` fields to manage in-app copy, `Void` fields for analytics events, and 
 * fields with custom object and list types for more complex app configuration, 
 * e.g. to use Hypertune as a CMS.
 * 
 * Once you've changed your schema, set your flag logic in the Logic view.
 */
export class SourceNode extends sdk.Node {
  override typeName = "Query" as const;

  /**
   * You can add arguments to any field in your schema, which you can then use when
   * setting its logic, including the logic of any nested fields. Your root field 
   * already has a `context` argument. Since all flags are nested under the root 
   * field, this context will be available to all of them.
   */
  root({ args }: { args: RootArgs; }): RootNode {
    const props0 = this.getFieldNodeProps("root", { fieldArguments: args });
    const expression0 = props0.expression;

    if (
      expression0 &&
      expression0.type === "ObjectExpression" &&
      expression0.objectTypeName === "Root"
    ) {
      return new RootNode(props0);
    }

    const node = new RootNode(props0);
    node._logUnexpectedTypeError();
    return node;
  }
}

export type DehydratedState = sdk.DehydratedState<undefined, VariableValues>

const sources: { [key: string]: SourceNode } = {};

export type CreateSourceOptions = {
  token: string; 
  variableValues?: VariableValues;
  override?: sdk.DeepPartial<undefined> | null;
  key?: string;
} & sdk.CreateOptions

export function createSource({
  token,
  variableValues = {},
  override,
  key,
  ...options
}: CreateSourceOptions): SourceNode {
  const sourceKey =
    key ?? (typeof window === "undefined" ? "server" : "client");

  if (!sources[sourceKey]) {
    sources[sourceKey] = sdk.create({
      NodeConstructor: SourceNode,
      token,
      query,
      queryCode,
      variableValues,
      override,
      options,
    });
  }

  return sources[sourceKey];
}

export const emptySource = new SourceNode({
  context: null,
  logger: null,
  parent: null,
  step: null,
  expression: null,
  initDataHash: null,
});

export function createSourceForServerOnly({
  token,
  variableValues = {},
  override,
  key,
  ...options
}: CreateSourceOptions): SourceNode {
  return typeof window === "undefined"
    ? createSource({ token, variableValues, override, ...options })
    : emptySource;
}

export const overrideCookieName = "hypertuneOverride";

/**
 * @deprecated use createSource instead.
 */
export const initHypertune = createSource
/**
 * @deprecated use SourceNode instead.
 */
export type QueryNode = SourceNode;
/**
 * @deprecated use undefined instead.
 */
export type Query = undefined;
