import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';

export const useEmailStore = create((set, get) => {

  return {
    emails: [],
    selectedEmail: null,
    isEmailsLoading: false,
    isEmailLoading: false,

    getEmails: async () => {
      set({ isEmailsLoading: true });
      try {
        const response = await axiosInstance.get('/email');
        set({ emails: response.data, isEmailsLoading: false });
      } catch (error) {
        console.error('Error fetching emails:', error);
        set({ isEmailsLoading: false, emails: [] });
      }
    },

    setSelectedEmail: (email) => set({ selectedEmail: email }),

    getEmailById: async (id) => {
      set({ isEmailLoading: true });
      try {
        const response = await axiosInstance.get(`/email/${id}`);
        const fetchedEmail = { ...response.data, isFetched: true }; // mark as fetched
        set({ selectedEmail: fetchedEmail, isEmailLoading: false });
      } catch (error) {
        console.error('Error fetching email:', error);
        set({ isEmailLoading: false });
      }
    },

    deleteEmail: async (id) => {
      try {
        await axiosInstance.delete(`/email/${id}`);
        set((state) => ({
          emails: state.emails.filter((email) => email._id !== id),
          selectedEmail: null,
        }));
      } catch (error) {
        console.error('Error deleting email:', error);
      }
    },
    
    addNewEmail: (newEmail) => set((state) => ({
        emails: [newEmail, ...state.emails]
      })),
  };
});