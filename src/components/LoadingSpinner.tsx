
export default function LoadingSpinner({ size = "medium" }) {
  const spinnerSize = {
    small: "h-4 w-4",
    medium: "h-8 w-8",
    large: "h-16 w-16",
  }[size];

  return (
    <div className="flex justify-center items-center">
      <div
        className={`animate-spin rounded-full border-t-4 border-blue-500 border-solid ${spinnerSize}`}
      />
    </div>
  );
}