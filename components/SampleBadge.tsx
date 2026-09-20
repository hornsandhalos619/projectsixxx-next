export function SampleBadge({ label = "Sample" }: { label?: string }) {
  return <span className="badge">{label}</span>;
}
