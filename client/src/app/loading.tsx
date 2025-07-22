// components/Loading.tsx
export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-gray-900">
      <div className="flex flex-col items-center space-y-4">
        {/* Spinner */}
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />

        {/* Animated Text */}
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-700 dark:text-white animate-pulse">
            Loading ${process.env.PUBLIC_APP_NAME}...
          </p>
        </div>
      </div>
    </div>
  );
}
