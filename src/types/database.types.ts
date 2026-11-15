export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type DeviceType = "ps5" | "vr" | "sim";
export type BookingSource = "online" | "walk-in" | "phone";
export type BookingStatus =
  | "held"
  | "confirmed"
  | "checked_in"
  | "completed"
  | "cancelled"
  | "no_show"
  | "expired";
export type RefundStatus = "pending" | "paid" | "rejected";
export type OccupancyKind = "booking" | "block";
export type WaitlistStatus = "waiting" | "notified" | "converted" | "expired";
export type StaffRole = "owner" | "staff";
export type NotificationType =
  | "new_booking"
  | "cancellation"
  | "refund_pending"
  | "reminder"
  | "waitlist_offer"
  | "refund_sent";

export interface Database {
  public: {
    Tables: {
      devices: {
        Row: {
          id: string;
          name: string;
          type: DeviceType;
          zone: string | null;
          display_order: number;
          max_persons: number;
          image_url: string | null;
          description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: DeviceType;
          zone?: string | null;
          display_order?: number;
          max_persons?: number;
          image_url?: string | null;
          description?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          type?: DeviceType;
          zone?: string | null;
          display_order?: number;
          max_persons?: number;
          image_url?: string | null;
          description?: string | null;
          is_active?: boolean;
        };
      };
      pricing_rules: {
        Row: {
          id: string;
          device_type: DeviceType;
          persons: number;
          price_per_hour: number;
          day_type: string | null;
          time_window: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          device_type: DeviceType;
          persons: number;
          price_per_hour: number;
          day_type?: string | null;
          time_window?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          device_type?: DeviceType;
          persons?: number;
          price_per_hour?: number;
          day_type?: string | null;
          time_window?: string | null;
          is_active?: boolean;
        };
      };
      settings: {
        Row: {
          key: string;
          value: string;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: string;
        };
        Update: {
          key?: string;
          value?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          mobile: string;
          name: string | null;
          village: string | null;
          no_show_count: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          mobile: string;
          name?: string | null;
          village?: string | null;
          no_show_count?: number;
          notes?: string | null;
        };
        Update: {
          id?: string;
          mobile?: string;
          name?: string | null;
          village?: string | null;
          no_show_count?: number;
          notes?: string | null;
        };
      };
      villages: {
        Row: {
          id: string;
          name: string;
          normalized_name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          normalized_name?: string;
        };
        Update: {
          id?: string;
          name?: string;
          normalized_name?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          booking_code: string;
          customer_id: string;
          source: BookingSource;
          status: BookingStatus;
          start_at: string;
          end_at: string;
          hours: number;
          total_amount: number;
          hold_expires_at: string | null;
          created_by_staff_id: string | null;
          checked_in_at: string | null;
          cancelled_at: string | null;
          cancelled_by: string | null;
          cancel_reason: string | null;
          refund_eligible: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_code?: string;
          customer_id: string;
          source: BookingSource;
          status?: BookingStatus;
          start_at: string;
          end_at: string;
          hours: number;
          total_amount: number;
          hold_expires_at?: string | null;
          created_by_staff_id?: string | null;
          refund_eligible?: boolean;
        };
        Update: {
          id?: string;
          booking_code?: string;
          customer_id?: string;
          source?: BookingSource;
          status?: BookingStatus;
          start_at?: string;
          end_at?: string;
          hours?: number;
          total_amount?: number;
          hold_expires_at?: string | null;
          created_by_staff_id?: string | null;
          checked_in_at?: string | null;
          cancelled_at?: string | null;
          cancelled_by?: string | null;
          cancel_reason?: string | null;
          refund_eligible?: boolean;
        };
      };
      booking_items: {
        Row: {
          id: string;
          booking_id: string;
          device_id: string;
          persons: number;
          hours: number;
          rate: number;
          amount: number;
        };
        Insert: {
          id?: string;
          booking_id: string;
          device_id: string;
          persons: number;
          hours: number;
          rate: number;
          amount: number;
        };
        Update: {
          id?: string;
          booking_id?: string;
          device_id?: string;
          persons?: number;
          hours?: number;
          rate?: number;
          amount?: number;
        };
      };
      device_occupancy: {
        Row: {
          id: string;
          device_id: string;
          during: { start: string; end: string };
          kind: OccupancyKind;
          booking_item_id: string | null;
          reason: string | null;
        };
        Insert: {
          id?: string;
          device_id: string;
          during: { start: string; end: string };
          kind: OccupancyKind;
          booking_item_id?: string | null;
          reason?: string | null;
        };
        Update: {
          id?: string;
          device_id?: string;
          during?: { start: string; end: string };
          kind?: OccupancyKind;
          booking_item_id?: string | null;
          reason?: string | null;
        };
      };
      payments: {
        Row: {
          id: string;
          booking_id: string;
          provider: string | null;
          method: string | null;
          app_used: string | null;
          amount: number;
          status: string;
          provider_reference: string | null;
          paid_at: string | null;
          raw_payload: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          provider?: string | null;
          method?: string | null;
          app_used?: string | null;
          amount: number;
          status?: string;
          provider_reference?: string | null;
          paid_at?: string | null;
          raw_payload?: Json | null;
        };
        Update: {
          id?: string;
          booking_id?: string;
          provider?: string | null;
          method?: string | null;
          app_used?: string | null;
          amount?: number;
          status?: string;
          provider_reference?: string | null;
          paid_at?: string | null;
          raw_payload?: Json | null;
        };
      };
      refunds: {
        Row: {
          id: string;
          booking_id: string;
          payment_id: string | null;
          amount: number;
          status: RefundStatus;
          refund_to_number: string | null;
          refund_app: string | null;
          refund_reference: string | null;
          requested_at: string;
          paid_at: string | null;
          paid_by_staff_id: string | null;
          reason: string | null;
        };
        Insert: {
          id?: string;
          booking_id: string;
          payment_id?: string | null;
          amount: number;
          status?: RefundStatus;
          refund_to_number?: string | null;
          refund_app?: string | null;
          refund_reference?: string | null;
          paid_by_staff_id?: string | null;
          reason?: string | null;
        };
        Update: {
          id?: string;
          booking_id?: string;
          payment_id?: string | null;
          amount?: number;
          status?: RefundStatus;
          refund_to_number?: string | null;
          refund_app?: string | null;
          refund_reference?: string | null;
          paid_at?: string | null;
          paid_by_staff_id?: string | null;
          reason?: string | null;
        };
      };
      waitlist: {
        Row: {
          id: string;
          device_id: string | null;
          device_type: DeviceType | null;
          desired_start: string;
          desired_end: string;
          customer_id: string;
          status: WaitlistStatus;
          token: string;
          notified_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          device_id?: string | null;
          device_type?: DeviceType | null;
          desired_start: string;
          desired_end: string;
          customer_id: string;
          status?: WaitlistStatus;
          token?: string;
        };
        Update: {
          id?: string;
          device_id?: string | null;
          device_type?: DeviceType | null;
          desired_start?: string;
          desired_end?: string;
          customer_id?: string;
          status?: WaitlistStatus;
          token?: string;
          notified_at?: string | null;
        };
      };
      staff: {
        Row: {
          id: string;
          name: string;
          role: StaffRole;
          pin_hash: string;
          is_active: boolean;
          failed_attempts: number;
          locked_until: string | null;
          last_login_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          role: StaffRole;
          pin_hash: string;
          is_active?: boolean;
          failed_attempts?: number;
        };
        Update: {
          id?: string;
          name?: string;
          role?: StaffRole;
          pin_hash?: string;
          is_active?: boolean;
          failed_attempts?: number;
          locked_until?: string | null;
          last_login_at?: string | null;
        };
      };
      audit_log: {
        Row: {
          id: string;
          at: string;
          staff_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          before: Json | null;
          after: Json | null;
          reason: string | null;
        };
        Insert: {
          id?: string;
          at?: string;
          staff_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          before?: Json | null;
          after?: Json | null;
          reason?: string | null;
        };
        Update: never;
      };
      notifications: {
        Row: {
          id: string;
          type: NotificationType;
          priority: number;
          booking_id: string | null;
          payload: Json | null;
          created_at: string;
          acknowledged_by: string | null;
          acknowledged_at: string | null;
        };
        Insert: {
          id?: string;
          type: NotificationType;
          priority?: number;
          booking_id?: string | null;
          payload?: Json | null;
        };
        Update: {
          id?: string;
          type?: NotificationType;
          priority?: number;
          booking_id?: string | null;
          payload?: Json | null;
          acknowledged_by?: string | null;
          acknowledged_at?: string | null;
        };
      };
      push_subscriptions: {
        Row: {
          id: string;
          staff_id: string;
          endpoint: string;
          p256dh_key: string;
          auth_key: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          staff_id: string;
          endpoint: string;
          p256dh_key: string;
          auth_key: string;
        };
        Update: {
          id?: string;
          staff_id?: string;
          endpoint?: string;
          p256dh_key?: string;
          auth_key?: string;
        };
      };
      message_log: {
        Row: {
          id: string;
          channel: string;
          to_number: string;
          template: string | null;
          status: string;
          provider_message_id: string | null;
          sent_at: string;
        };
        Insert: {
          id?: string;
          channel: string;
          to_number: string;
          template?: string | null;
          status?: string;
          provider_message_id?: string | null;
        };
        Update: {
          id?: string;
          channel?: string;
          to_number?: string;
          template?: string | null;
          status?: string;
          provider_message_id?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_availability: {
        Args: {
          p_date: string;
          p_start: string;
          p_hours: number;
        };
        Returns: {
          device_id: string;
          name: string;
          type: DeviceType;
          status: "free" | "booked";
          price_per_hour: number;
        }[];
      };
      get_device_day_timeline: {
        Args: {
          p_device_id: string;
          p_date: string;
        };
        Returns: {
          hour: number;
          status: "free" | "booked" | "held";
          booking_id: string | null;
        }[];
      };
      create_hold: {
        Args: {
          p_mobile: string;
          p_name: string | null;
          p_village: string | null;
          p_items: { device_id: string; persons: number; hours: number }[];
          p_start: string;
          p_hours: number;
          p_source: BookingSource;
        };
        Returns: {
          booking_id: string;
          booking_code: string;
          hold_expires_at: string;
          total_amount: number;
          taken_device: string | null;
        };
      };
      confirm_booking: {
        Args: {
          p_booking_id: string;
          p_payment_id: string;
        };
        Returns: {
          booking_id: string;
          status: BookingStatus;
        };
      };
      cancel_booking: {
        Args: {
          p_booking_id: string;
          p_actor_id: string | null;
          p_actor_type: "customer" | "staff";
          p_reason: string | null;
        };
        Returns: {
          booking_id: string;
          status: BookingStatus;
          refund_eligible: boolean;
          refund_id: string | null;
        };
      };
      lookup_booking: {
        Args: {
          p_booking_code: string;
          p_mobile: string;
        };
        Returns: {
          booking_id: string;
          booking_code: string;
          status: BookingStatus;
          start_at: string;
          end_at: string;
          total_amount: number;
          customer_name: string | null;
          customer_mobile: string;
          items: { device_name: string; persons: number; hours: number; amount: number }[];
          payment_status: string | null;
          refund_status: RefundStatus | null;
          refund_amount: number | null;
        };
      };
      staff_login: {
        Args: {
          p_pin: string;
        };
        Returns: {
          staff_id: string;
          name: string;
          role: StaffRole;
          session_token: string;
          expires_at: string;
        };
      };
    };
  };
}
