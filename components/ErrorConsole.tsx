import React from 'react';
import { useErrorContext } from './ErrorContext';

const ErrorConsole: React.FC = () => {
  const { errors, clearErrors } = useErrorContext();

  if (errors.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-full bg-white border border-red-300 shadow-lg rounded-lg overflow-hidden">
      <div className="flex items-center justify-between bg-red-100 px-4 py-2 border-b border-red-200">
        <span className="font-semibold text-red-700">Error Console</span>
        <button onClick={clearErrors} className="text-xs text-red-500 hover:underline">Clear</button>
      </div>
      <div className="max-h-80 overflow-y-auto divide-y divide-red-100">
        {errors.map((err) => (
          <div key={err.id} className="p-3 text-sm">
            <div className="font-bold text-red-600">{err.message}</div>
            {err.context && <div className="text-gray-500">Context: {err.context}</div>}
            {err.stack && <details className="text-xs text-gray-400"><summary>Stack</summary><pre>{err.stack}</pre></details>}
            <div className="text-xs text-gray-400 mt-1">{err.time.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ErrorConsole;
