export const validateMobile = (mobile) => {
  const mobileRegex = /^[6-9]\d{9}$/;
  return mobileRegex.test(mobile);
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateOTP = (otp) => {
  return otp && otp.length === 6 && /^\d{6}$/.test(otp);
};

export const validateName = (name) => {
  return name && name.trim().length >= 2;
};

export const validateTableNumber = (tableNumber) => {
  return tableNumber && tableNumber.trim().length > 0;
};

export const validatePrice = (price) => {
  return price && !isNaN(price) && parseFloat(price) > 0;
};

export const validateRestaurantId = (id) => {
  return id && id.trim().length >= 3;
};

export const getValidationError = (field, value) => {
  switch (field) {
    case 'mobile':
      if (!value) return 'Mobile number is required';
      if (!validateMobile(value)) return 'Please enter a valid 10-digit mobile number';
      return null;
    
    case 'email':
      if (!value) return 'Email is required';
      if (!validateEmail(value)) return 'Please enter a valid email address';
      return null;
    
    case 'otp':
      if (!value) return 'OTP is required';
      if (!validateOTP(value)) return 'OTP must be 6 digits';
      return null;
    
    case 'name':
      if (!value) return 'Name is required';
      if (!validateName(value)) return 'Name must be at least 2 characters';
      return null;
    
    case 'tableNumber':
      if (!value) return 'Table number is required';
      return null;
    
    case 'price':
      if (!value) return 'Price is required';
      if (!validatePrice(value)) return 'Please enter a valid price';
      return null;
    
    case 'restaurantId':
      if (!value) return 'Restaurant ID is required';
      if (!validateRestaurantId(value)) return 'Restaurant ID must be at least 3 characters';
      return null;
    
    default:
      return null;
  }
};