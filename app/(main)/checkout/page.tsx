interface CheckoutPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const params = await searchParams;
  const canceled = 
    typeof params.canceled === "string"
      ? params.canceled
      : Array.isArray(params.canceled)
      ? params.canceled[0]
      : undefined;

  if (canceled) {
    console.log(
      'Order canceled -- continue to shop around and checkout when you\'re ready.'
    )
  }
  return (
    <form action="/api/checkout_sessions" method="POST">
      <section>
        <button type="submit" role="link">
          Checkout
        </button>
      </section>
    </form>
  )
}