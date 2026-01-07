import { redirect } from 'next/navigation';
import Link from 'next/link';
import { stripe } from '@/lib/stripe';

interface SuccessProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Success({ searchParams }: SuccessProps) {
  const params = await searchParams;
  const session_id =
    typeof params.session_id === "string"
      ? params.session_id
      : Array.isArray(params.session_id)
      ? params.session_id[0]
      : undefined;

  if (!session_id) {
    redirect('/');
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['line_items', 'payment_intent']
    });
    
    const status = session.status;
    const customerEmail = session.customer_details?.email;
    const customerName = session.customer_details?.name;

    // If session is still open, redirect to home
    if (status === 'open') {
      redirect('/');
    }

    // If payment is complete, show success page
    if (status === 'complete') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            {/* Success Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            {/* Success Message */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Payment Successful!
            </h1>
            
            <p className="text-gray-600 mb-6">
              Thank you for your purchase{customerName ? `, ${customerName}` : ''}!
            </p>

            {customerEmail && (
              <p className="text-sm text-gray-500 mb-8">
                A confirmation email has been sent to{' '}
                <span className="font-medium text-gray-700">{customerEmail}</span>
              </p>
            )}

            {/* Support Contact */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <p className="text-sm text-gray-600 mb-2">
                Have questions about your purchase?
              </p>
              <a
                href={`mailto:${process.env.SUPPORT_EMAIL || 'support@whoami.com'}`}
                className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
              >
                Contact Support
              </a>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="/dashboard"
                className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors text-center"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/"
                className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    // Handle other statuses (expired, etc.)
    redirect('/');
  } catch (error) {
    // If there's an error retrieving the session, redirect to home
    console.error('Error retrieving checkout session:', error);
    redirect('/');
  }
}

