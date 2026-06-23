export interface PatientDemographics {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender?: string;
  street?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  phone?: string;
  member_id?: string;
  ssn_last4?: string;
}

export interface MatchResult {
  endpoint: {
    id: string;
    name: string;
    base_url: string;
    endpoint_type: string;
    auth_type?: string;
    source: string;
  };
  matched: boolean;
  patient_id?: string;
  match_confidence?: number;
  access_url?: string;
  auth_instructions?: string;
  auth_url?: string;
  error?: string;
}

export interface SearchStatus {
  state: "pending" | "progress" | "complete" | "failure";
  current: number;
  total: number;
  matches: number;
  results: MatchResult[];
  errors?: MatchResult[];
}
