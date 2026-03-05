/** Supabase Database type definitions for SunEliteHomes */

export interface Database {
  public: {
    Tables: {
      properties: {
        Row: {
          id: number;
          created_at: string;
          updated_at: string;
          title: string;
          ref: string;
          price: number;
          currency: string;
          price_freq: 'sale' | 'month';
          type: string;
          build_year: number | null;
          town: string;
          postcode: string;
          province: string;
          address: string;
          latitude: number | null;
          longitude: number | null;
          beds: number;
          baths: number;
          pool: boolean;
          surface_built: number;
          surface_plot: number;
          energy_consumption: string;
          energy_emissions: string;
          description: string;
          features: string[];
          status: string;
          images: string[];
          agent_id: string | null;
        };
        Insert: {
          id?: number;
          created_at?: string;
          updated_at?: string;
          title?: string;
          ref?: string;
          price?: number;
          currency?: string;
          price_freq?: 'sale' | 'month';
          type?: string;
          build_year?: number | null;
          town?: string;
          postcode?: string;
          province?: string;
          address?: string;
          latitude?: number | null;
          longitude?: number | null;
          beds?: number;
          baths?: number;
          pool?: boolean;
          surface_built?: number;
          surface_plot?: number;
          energy_consumption?: string;
          energy_emissions?: string;
          description?: string;
          features?: string[];
          status?: string;
          images?: string[];
          agent_id?: string | null;
        };
        Update: {
          id?: number;
          created_at?: string;
          updated_at?: string;
          title?: string;
          ref?: string;
          price?: number;
          currency?: string;
          price_freq?: 'sale' | 'month';
          type?: string;
          build_year?: number | null;
          town?: string;
          postcode?: string;
          province?: string;
          address?: string;
          latitude?: number | null;
          longitude?: number | null;
          beds?: number;
          baths?: number;
          pool?: boolean;
          surface_built?: number;
          surface_plot?: number;
          energy_consumption?: string;
          energy_emissions?: string;
          description?: string;
          features?: string[];
          status?: string;
          images?: string[];
          agent_id?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
