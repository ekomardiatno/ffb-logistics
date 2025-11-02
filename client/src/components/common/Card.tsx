export default function Card({
  title,
  children,
  right
}: {
  title?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white shadow p-5">
      {(title || right) && (
        <div className="mb-3 flex items-left md:items-center justify-between flex-col md:flex-row gap-3">
          {title ? <h3 className="text-lg font-semibold">{title}</h3> : <div />}
          {right}
        </div>
      )}
      {children}
    </div>
  );
}