// Types for home page data
export interface CtaButton {
  label: string;
  link: string;
  primary?: boolean;
}

export interface HomeData {
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaButtons: CtaButton[];
  promoText?: string;
}

export interface HomeApiResponse {
  success: boolean;
  data: HomeData;
  message?: string;
  timestamp?: string;
}