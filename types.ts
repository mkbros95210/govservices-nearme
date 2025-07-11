

export type { UploadedFileRecord } from './components/DocumentUploader';
import type { UploadedFileRecord } from './components/DocumentUploader';

// --- Dynamic Booking Configuration Types ---

export interface FormField {
  id: string; // e.g., 'fullName', 'fatherName'
  label: string;
  type: 'text' | 'email' | 'date' | 'tel' | 'number';
  required: boolean;
}

export interface DocumentRequirement {
  id: string; // e.g., 'poi', 'poa'
  name: string;
  description: string;
}

export interface BookingConfig {
  form_fields: FormField[];
  document_requirements: DocumentRequirement[];
}


// --- Core Application Types ---

export interface Service {
  id: number;
  name: string;
  description?: string | null;
  icon_name: string;
  parent_id?: number | null;
  // New fields for admin control
  is_featured: boolean;
  display_order: number;
  is_bookable: boolean;
  booking_config: BookingConfig | null;
  price?: number | null; // Add price field
  // Client-side hierarchy
  subServices?: Service[];
}

export interface Profile {
    id: string;
    role: 'user' | 'admin';
    full_name?: string | null;
    email?: string | null;
    dob?: string | null;
    mobile_number?: string | null;
}

export interface UserMessage {
    sender: 'admin' | 'user';
    text: string;
    timestamp: string;
}

export interface AdminNote {
    text: string;
    timestamp: string;
    admin_name: string; // To track which admin wrote the note
}

export interface Booking {
    id: number;
    created_at: string;
    status: string;
    user_id: string;
    service_id: number;
    services: { name: string } | null; 
    profiles: { full_name: string | null; email: string | null; } | null; 
    user_details: Record<string, any> | null; // Now a dynamic object from the form
    uploaded_files: UploadedFileRecord | null;
    admin_notes: AdminNote[] | null;
    user_messages: UserMessage[] | null;
}

// --- Global App Settings Type ---

export interface AppSettings {
    homepage_service_limit: number;
}

// --- Promo Banner Type ---
export interface PromoBannerSlide {
  id: number;
  title: string;
  subtitle: string;
  code: string;
  is_active: boolean;
  display_order: number;
}

// --- New Types for Advanced Features ---

export interface ServiceCenter {
    id: number;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    service_id: number;
    distance_km?: number;
    services?: { name: string, icon_name: string };
}

export interface Notification {
    id: number;
    user_id: string;
    message: string;
    link: string;
    is_read: boolean;
    created_at: string;
}
