import api from './api';

export interface FacultyProfileView {
  id: string;
  faculty_id: string;
  full_name: string;
  first_name?: string | null;
  last_name?: string | null;
  email: string;
  department: string;
  college?: string | null;
  faculty_role: string;
  role_title: string;
  rank?: string | null;
  mobile?: string | null;
  advisee_count: number;
  committee_role: string;
  consultation_hours?: string | null;
  specialization?: string | null;
  status: 'active' | 'on_leave' | 'inactive';
  editable_by: string;
  updated_at?: string | null;
}

export const facultyProfileService = {
  async getProfile(): Promise<FacultyProfileView> {
    const response = await api.get('/faculty/profile');
    return response.data.data;
  },
};
