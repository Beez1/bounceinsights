import { XCircleIcon } from '@heroicons/react/24/outline';

const ErrorAlert = ({ message, onDismiss }) => {
  return (
    <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-red-400">{message}</p>
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              className="inline-flex rounded-md bg-red-500/10 p-1.5 text-red-400 hover:bg-red-500/20"
              onClick={onDismiss}
            >
              <span className="sr-only">Dismiss</span>
              <XCircleIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorAlert; 