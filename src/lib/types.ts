export interface BrandProfile {
  id: string;
  user_id: string;
  name: string;
  industry?: string;
  uvp?: string;
  competitors?: string;
  avatar_name?: string;
  avatar_age?: number;
  avatar_location?: string;
  avatar_pains: string[];     // Array de 3 dolores en palabras del avatar
  avatar_desires: string[];   // Array de 3 deseos en palabras del avatar
  avatar_objections: string[]; // Objeciones frecuentes
  brand_adjectives: string[];  // 5 adjetivos de la marca
  forbidden_words: string[];   // Palabras prohibidas
  approved_copy?: string;      // Ejemplos de copy aprobado
  formality_level: number;     // 1-10
  product_name?: string;
  product_transformation?: string; // Antes → Después
  product_mechanism?: string;
  product_results?: string;
  product_guarantee?: string;
  product_price?: string;
  default_consciousness_level: number; // 1-5 (Schwartz)
  is_active: boolean;
  created_at: number;
  knowledge_base_text?: string; // Extracted text from uploaded PDFs/DOCX
}

export type ConsciousnessLevel = 1 | 2 | 3 | 4 | 5;
