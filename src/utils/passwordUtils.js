import bcrypt from 'bcryptjs';

// Simple hash function for client-side use
export const hashPassword = (password) => {
  // Using a synchronous hash with a salt round of 10
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

export const verifyPassword = (password, hash) => {
  return bcrypt.compareSync(password, hash);
};
