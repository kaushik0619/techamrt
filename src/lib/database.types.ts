export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          email: string;
          password_hash: string;
          role: 'customer' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          email: string;
          password_hash: string;
          role?: 'customer' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          email?: string;
          password_hash?: string;
          role?: 'customer' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          phone: string;
          address_line1: string;
          address_line2: string | null;
          city: string;
          state: string;
          postal_code: string;
          country: string;
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          phone: string;
          address_line1: string;
          address_line2?: string | null;
          city: string;
          state: string;
          postal_code: string;
          country?: string;
          is_default?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string;
          phone?: string;
          address_line1?: string;
          address_line2?: string | null;
          city?: string;
          state?: string;
          postal_code?: string;
          country?: string;
          is_default?: boolean;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string;
          category: string;
          price: number;
          stock: number;
          images: string[];
          specs: Record<string, any> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          category: string;
          price: number;
          stock?: number;
          images?: string[];
          specs?: Record<string, any> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          category?: string;
          price?: number;
          stock?: number;
          images?: string[];
          specs?: Record<string, any> | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          quantity: number;
          added_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          quantity?: number;
          added_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          quantity?: number;
          added_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          total_amount: number;
          payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
          payment_method: 'stripe' | 'razorpay' | 'cod' | null;
          payment_id: string | null;
          order_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          shipping_address: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          total_amount: number;
          payment_status?: 'pending' | 'completed' | 'failed' | 'refunded';
          payment_method?: 'stripe' | 'razorpay' | 'cod' | null;
          payment_id?: string | null;
          order_status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          shipping_address: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          total_amount?: number;
          payment_status?: 'pending' | 'completed' | 'failed' | 'refunded';
          payment_method?: 'stripe' | 'razorpay' | 'cod' | null;
          payment_id?: string | null;
          order_status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          shipping_address?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          price?: number;
          created_at?: string;
        };
      };
      sales_events: {
        Row: {
          id: string;
          order_id: string;
          region: string;
          product_id: string;
          quantity: number;
          amount: number;
          timestamp: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          region: string;
          product_id: string;
          quantity: number;
          amount: number;
          timestamp?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          region?: string;
          product_id?: string;
          quantity?: number;
          amount?: number;
          timestamp?: string;
        };
      };
    };
  };
}
