export type LiveScreenEvent = {
  id: string;
  title: string;
  slug: string;
  event_date: string;
  is_paid: boolean;
  guest_access_code_enabled: boolean;
  guest_access_code: string | null;
};

export type LiveScreenPhoto = {
  id: string;
  public_url: string;
  uploaded_at: string;
};
