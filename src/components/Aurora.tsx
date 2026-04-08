// Static background — no JS animation, no heavy blur.
// Pure CSS gradients for near-zero render cost.
export default function Aurora() {
  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none"
      aria-hidden="true"
      style={{
        background:
          "radial-gradient(ellipse 70% 50% at 15% 0%, rgba(255,125,20,0.18), transparent 55%), radial-gradient(ellipse 60% 45% at 85% 100%, rgba(240,102,0,0.12), transparent 55%), radial-gradient(ellipse 50% 40% at 50% 50%, rgba(255,182,112,0.06), transparent 65%)",
      }}
    />
  );
}
