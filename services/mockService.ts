import { User } from '../types';

export const login = async (username: string): Promise<User> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: 'u1',
        name: username || 'Admin User',
        avatar: 'https://picsum.photos/100/100',
        role: 'admin'
      });
    }, 800);
  });
};

export const createProject = async (data: any): Promise<boolean> => {
  // Simulate backend API call
  console.log("Calling Backend API [POST /api/projects] with data:", data);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate successful creation
      resolve(true);
    }, 1500);
  });
};