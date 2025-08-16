export const getCheckoutUrl = () => {
  const baseUrl = window?.location?.origin || "https://trackmyincome.vercel.app";
  const successUrl = encodeURIComponent(`${baseUrl}/success`);
  const cancelUrl = encodeURIComponent(`${baseUrl}/pricing`);

  return `https://trackmyincome.lemonsqueezy.com/buy/fc8795bb-8bc2-483e-badf-a2b2afcfdd30?success_url=${successUrl}&cancel_url=${cancelUrl}`;
};

