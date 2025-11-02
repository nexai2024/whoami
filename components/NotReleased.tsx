'use client';

import { useRouter } from 'next/navigation';

export default function NotReleased() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  const handleTakeMeHome = () => {
    router.push('/dashboard');
  };

  return (
    <div>
      <div
  className="flex-col flex gap-12"
  style={{
    fontKerning: "normal",
  }}>
  <div className="flex-col flex gap-6 m-10">
    <div className="flex-col flex gap-3 font-semibold">
      <span className="text-violet-700 text-left">Beta Feature Release Notification</span>
      <h1 className="text-gray-900 text-4xl text-center mt-10">We can't display that page</h1>
    </div>
    <p className="text-gray-600 text-xl text-center">Sorry, the page you are looking for cant be displayed yet. The feature is still being tested and is waiting for approval.</p>
  </div>
  <div className="flex gap-3 font-semibold items-center justify-center">
    <button onClick={handleGoBack} className="text-gray-700 items-center cursor-pointer justify-center py-3 px-5 text-center flex w-32 h-12 rounded-lg gap-[0.38rem]">
      <svg className="text-zinc-400 w-5 h-5" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M19 12H5m0 0 7 7m-7-7 7-7" fill="none" stroke="#a4a7ae" />
      </svg>
      <span className="px-1">Go back</span>
    </button>
    <button onClick={handleTakeMeHome} className="text-white bg-violet-500 items-center cursor-pointer justify-center py-3 px-5 text-center flex w-40 h-12 rounded-lg">
      <span className="px-1">Take me home</span>
    </button>
  </div>
</div>

    </div>
  );
}