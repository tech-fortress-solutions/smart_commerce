// Define the promotion types
export type PromotionType = 'new stock' | 'discount promo' | 'buyOneGetOne';

// Define the shape of the promotion form data
export interface PromotionFormData {
  title: string;
  type: PromotionType;
  description: string;
  startDate: string;
  endDate: string;
}