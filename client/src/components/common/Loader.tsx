import classNames from "classnames";

export default function Loader({ label = "Loading...", containerClassName, spinnerClassName }: { label?: string, containerClassName?: string, spinnerClassName?: string }) {
  return (
    <div className={classNames(["flex items-center justify-center gap-3 py-10 text-gray-600", containerClassName])}>
      <div className={classNames(["h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-transparent", spinnerClassName])} />
      <span>{label}</span>
    </div>
  );
}