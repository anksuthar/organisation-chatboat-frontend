export interface Citation {
  document_id: number;
  document_title: string;
  page_number: number;
}

export interface ChatHistoryEntry {
  id: number;
  question: string;
  answer: string;
  created_at: string;
}

// Shapes of the structured SSE events the multi-intent agent can send
// alongside its templated reply text (backend specs/036-040) — each is a
// lightweight summary, not the full resource, since chat only needs enough
// to render a card/link pointing at the real page.
export interface ChatOrderSummary {
  id: number;
  status: string;
  total_amount: string;
  created_at: string;
}

export interface ChatProductSummary {
  id: number;
  name: string;
  price: string;
  sku: string;
}

export interface ChatProfileSummary {
  name: string;
  email: string;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
}

export interface ChatTicketSummary {
  ticket_number: string;
  order_id: number;
  status: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  suggestions?: string[];
  orders?: ChatOrderSummary[];
  products?: ChatProductSummary[];
  categories?: string[];
  profile?: ChatProfileSummary;
  ticket?: ChatTicketSummary;
  isStreaming?: boolean;
}
