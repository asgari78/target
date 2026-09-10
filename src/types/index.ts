export type PaymentMode = 'cash' | 'installment';
export type RegistrationType = 'in_person' | 'online';
export type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'failed';
export type AttendanceMode = 'in_person' | 'online';

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  grade: 'چهارم' | 'پنجم' | 'ششم';
  instructorName: string;
  instructorImageUrl: string | null;
  instructorBio: string | null;
  audience: string | null;
  curriculum: string | null;
  requirements: string | null;
  venueDetails: string | null;
  mapEmbedUrl: string | null;
  coverImageUrl: string | null;
  sessionsCount: number;
  sessionHours: number;
  scheduleText: string;
  startDate: string | null;
  locationInPerson: string;
  locationOnline: string;
  /** @deprecated Use courseOfferings for pricing */
  priceInPerson: number;
  /** @deprecated Use courseOfferings for pricing */
  priceOnline: number;
  /** @deprecated Use courseOfferings for pricing */
  originalPriceInPerson: number | null;
  /** @deprecated Use courseOfferings for pricing */
  discountPercentInPerson: number;
  /** @deprecated Use courseOfferings for pricing */
  originalPriceOnline: number | null;
  /** @deprecated Use courseOfferings for pricing */
  discountPercentOnline: number;
  /** @deprecated Use courseOfferings for pricing */
  installmentsCount: number;
  /** @deprecated Use courseOfferings for pricing */
  installmentInterestPct: number;
  inPersonAvailable: boolean;
  onlineAvailable: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  sessionDuration: string | null;
  /** New pricing model - offerings per attendance mode */
  courseOfferings?: CourseOffering[];
}

export interface CourseOffering {
  id: string;
  courseId: string;
  attendanceMode: AttendanceMode;
  cashPriceBeforeDiscount: number;
  cashPriceAfterDiscount: number;
  installmentsCount: number;
  installmentInterestPct: number;
  isAvailable: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  installments?: Installment[];
}

export interface Installment {
  id: string;
  offeringId: string;
  sequenceNumber: number;
  label: string;
  amountBeforeDiscount: number;
  amountAfterDiscount: number;
  dueMonthOffset: number;
  isDownPayment: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CourseRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  grade: 'چهارم' | 'پنجم' | 'ششم';
  instructor_name: string;
  instructor_image_url: string | null;
  instructor_bio: string | null;
  audience: string | null;
  curriculum: string | null;
  requirements: string | null;
  venue_details: string | null;
  map_embed_url: string | null;
  cover_image_url: string | null;
  sessions_count: number;
  session_hours: number;
  schedule_text: string;
  start_date: string | null;
  location_in_person: string;
  location_online: string;
  in_person_available: boolean;
  online_available: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  price_in_person: number;
  price_online: number;
  original_price_in_person: number | null;
  discount_percent_in_person: number;
  original_price_online: number | null;
  discount_percent_online: number;
  installments_count: number;
  installment_interest_pct: number;
  session_duration: string | null;
}


export interface CourseOfferingRow {
  id: string;
  course_id: string;
  attendance_mode: AttendanceMode;
  cash_price_before_discount: number;
  cash_price_after_discount: number;
  installments_count: number;
  installment_interest_pct: number;
  is_available: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface InstallmentRow {
  id: string;
  offering_id: string;
  sequence_number: number;
  label: string;
  amount_before_discount: number;
  amount_after_discount: number;
  due_month_offset: number;
  is_down_payment: boolean;
  created_at: string;
  updated_at: string;
}

/** Legacy types - kept for backward compatibility */
export interface LegacyInstallment {
  label: string;
  amount: number;
}

export interface LegacyInstallmentPlan {
  total: number;
  perInstallment: number;
  items: LegacyInstallment[];
}

export interface InstallmentItem {
  index: number;
  label: string;
  amount: number;
  dueDate: string; // ISO date string
  isDownPayment: boolean;
}

export interface OrderPricingResult {
  baseAmount: number;
  originalAmount: number | null;
  discountPercent: number;
  totalAmount: number;
  installments: InstallmentItem[];
  perInstallmentAmount: number;
}

export interface RegistrationRequestInsert {
  course_id: string;
  phone_number: string;
  student_name?: string;
  registration_type: RegistrationType;
  payment_mode: PaymentMode;
}

export interface RegistrationRequestRow {
  id: string;
  course_id: string;
  phone_number: string;
  student_name: string;
  registration_type: RegistrationType;
  payment_mode: PaymentMode;
  status: 'new' | 'contacted' | 'done' | 'rejected';
  created_at: string;
}

export interface OrderRow {
  id: string;
  registration_request_id: string | null;
  course_id: string;
  phone_number: string;
  student_name: string;
  registration_type: RegistrationType;
  payment_mode: PaymentMode;
  base_amount: number;
  original_amount: number | null;
  discount_percent: number;
  interest_percent: number;
  total_amount: number;
  installments_count: number;
  installment_index: number;
  installment_due_date: string | null;
  status: OrderStatus;
  authority: string | null;
  ref_id: number | null;
  paid_at: string | null;
  is_reservation: boolean;
  callback_payload: unknown | null;
  created_at: string;
  updated_at: string;
}

export interface OrderInsert {
  course_id: string;
  phone_number: string;
  student_name?: string;
  registration_type: RegistrationType;
  payment_mode: PaymentMode;
  base_amount: number;
  original_amount?: number | null;
  discount_percent?: number;
  interest_percent?: number;
  total_amount: number;
  installments_count?: number;
  installment_index?: number;
  is_reservation?: boolean;
}

export interface PaymentLogRow {
  id: string;
  order_id: string;
  event: string;
  payload: unknown;
  created_at: string;
}

export interface CreateOrderRequest {
  courseId: string;
  studentName: string;
  phoneNumber: string;
  registrationType: RegistrationType;
  paymentMode: PaymentMode;
}

export interface CreateOrderResponse {
  orderId: string;
  authority: string;
  payUrl: string;
  amount: number;
}

export interface CreateReservationRequest {
  courseId: string;
  studentName: string;
  phoneNumber: string;
  registrationType: RegistrationType;
}

export interface CreateReservationResponse {
  success: boolean;
  orderId: string;
  message: string;
}

export interface CreateConsultationRequest {
  courseId: string;
  studentName: string;
  phoneNumber: string;
  registrationType: RegistrationType;
}

export interface CreateConsultationResponse {
  success: boolean;
  consultationId: string;
  message: string;
}

export interface PaymentResult {
  status: 'success' | 'failed' | 'cancelled' | 'pending';
  orderId?: string;
  error?: string;
}

export interface ModalPaymentState {
  mode: 'idle' | 'initiating' | 'redirecting' | 'result';
  result?: PaymentResult;
}