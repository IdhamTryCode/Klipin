// No-op wrapper now — animations moved to CSS for performance.
export default function DashboardAnimations({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
