import { supabase } from '../lib/supabase';

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data.user;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Sign-in error:", error.message);
    } else {
      console.error("An unexpected error occurred during sign-in.");
    }
    throw error;
  }
};

export const signUp = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    return data.user;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Sign-up error:", error.message);
    } else {
      console.error("An unexpected error occurred during sign-up.");
    }
    throw error;
  }
};

export const logOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    console.log("User signed out");
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Logout error:", error.message);
    } else {
      console.error("An unexpected error occurred during logout.");
    }
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Get user error:", error.message);
    } else {
      console.error("An unexpected error occurred while getting user.");
    }
    throw error;
  }
}; 