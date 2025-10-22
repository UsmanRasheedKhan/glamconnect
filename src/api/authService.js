import axiosInstance from './axiosConfig';

// ========== SIGNUP FUNCTION ==========
// This function handles user registration
// It takes 4 pieces of information from the user
export const signup = async (name, email, contact, password) => {
  try {
    // Send a POST request to the API with user information
    // POST means we're SENDING data to the server
    // An empty string '' means send to the base URL (api.php)
    const response = await axiosInstance.post('', {
      action: 'signup',        // Tell server we want to signup
      name,                    // User's full name
      email,                   // User's email address
      contact,                 // User's phone number
      password,                // User's password
      role: 'customer',        // Assign them as a customer
    });
    
    // Return the response (which includes user ID, email, etc.)
    return response.data;
    
  } catch (error) {
    // If something goes wrong, log the error and throw it back
    console.error('Signup error:', error.response?.data || error.message);
    throw error.response?.data || { success: false, message: 'Signup failed' };
  }
};

// ========== LOGIN FUNCTION ==========
// This function handles user login
// It takes email and password from the user
export const login = async (email, password) => {
  try {
    // Send a POST request to login
    const response = await axiosInstance.post('', {
      action: 'login',         // Tell server we want to login
      email,                   // User's email
      password,                // User's password
    });
    
    // Return the response (which includes token and user info)
    return response.data;
    
  } catch (error) {
    // If login fails, show error
    console.error('Login error:', error.response?.data || error.message);
    throw error.response?.data || { success: false, message: 'Login failed' };
  }
};

// ========== PASSWORD RESET FUNCTION ==========
// This function handles password reset
// User provides email, phone number, and new password for verification
export const resetPassword = async (email, contact, newPassword) => {
  try {
    // Send a POST request to reset password
    const response = await axiosInstance.post('', {
      action: 'resetPassword',  // Tell server we want to reset password
      email,                    // User's email for verification
      contact,                  // User's phone for verification
      newPassword,              // The new password user wants
    });
    
    // Return the response (success message)
    return response.data;
    
  } catch (error) {
    // If reset fails, show error
    console.error('Reset password error:', error.response?.data || error.message);
    throw error.response?.data || { success: false, message: 'Password reset failed' };
  }
};

// Export all functions as a default object
export default {
  signup,
  login,
  resetPassword,
};
