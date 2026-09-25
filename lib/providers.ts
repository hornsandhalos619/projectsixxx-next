export type PublicProvider = {
  id: "credentials";
  label: string;
};

/** Visible house login. Google is not advertised. X is a later PR. */
export function publicProviders(): PublicProvider[] {
  return [{ id: "credentials", label: "Continue with house key" }];
}

export function advertisedProviderIds(): string[] {
  return publicProviders().map((provider) => provider.id);
}
