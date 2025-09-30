import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PublicPage from './PublicPage';

const PreviewWindow = () => {
  const { slug } = useParams();
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  useEffect(() => {
    // Check if this is opened in a preview window
    const urlParams = new URLSearchParams(window.location.search);
    const isPreview = urlParams.get('preview') === 'true' || window.name === 'preview';
    setIsPreviewMode(isPreview);

    if (isPreview) {
      // Add preview-specific styles
      document.body.classList.add('preview-mode');
      document.title = `Preview: ${slug} - WhoAmI`;
    }

    return () => {
      document.body.classList.remove('preview-mode');
    };
  }, [slug]);

  return (
    <div className={isPreviewMode ? 'preview-container' : ''}>
      {isPreviewMode && (
        <div className="preview-header bg-indigo-600 text-white px-4 py-2 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Live Preview Mode</span>
          </div>
          <button
            onClick={() => window.close()}
            className="text-white hover:text-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>
      )}
      <PublicPage />
    </div>
  );
};

export default PreviewWindow;