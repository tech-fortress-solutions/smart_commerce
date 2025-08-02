// Define the promotion types
export type PromotionType = 'new stock' | 'discount promo' | 'buyOneGetOne' | 'none';

// Define the shape of the promotion form data
export interface PromotionFormData {
  title: string;
  type: PromotionType;
  description: string;
  startDate: string;
  endDate: string;
}

export type Promotion = {
  _id: string;
  title: string;
  type: string;
  description: string;
  startDate: string; // ISO 8601 string or date format
  endDate: string;   // ISO 8601 string or date format
  promoBanner: string;
  createdAt: string;
};