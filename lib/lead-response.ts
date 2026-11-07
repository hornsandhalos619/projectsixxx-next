/** True only when the list API confirms the address was stored. */
export async function leadCaptureSucceeded(response: Response): Promise<boolean> {
  if (!response.ok) return false;
  try {
    const payload = (await response.json()) as { persisted?: unknown };
    return payload?.persisted === true;
  } catch {
    return false;
  }
}
