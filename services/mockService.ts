import { User } from '../types';
import { MOCK_DEPARTMENTS, MOCK_DEVELOPERS } from '../constants';

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

export const getProjectMembers = async (): Promise<any[]> => {
  // Simulate fetching all available members for the tenant/organization
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 101, name: 'Alice Smith', role: 'Product Manager', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice' },
        { id: 102, name: 'Bob Johnson', role: 'Senior Developer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob' },
        { id: 103, name: 'Carol Williams', role: 'UI/UX Designer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol' },
        { id: 104, name: 'David Brown', role: 'Frontend Engineer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David' },
        { id: 105, name: 'Eva Davis', role: 'Backend Engineer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eva' },
        { id: 106, name: 'Frank Miller', role: 'QA Engineer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Frank' },
      ]);
    }, 600);
  });
};

export const updateProject = async (id: number, data: any): Promise<boolean> => {
  console.log(`Calling Backend API [PUT /api/projects/${id}] with data:`, data);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 1000);
  });
};

export const copyProject = async (id: number): Promise<boolean> => {
  console.log(`Calling Backend API [POST /api/projects/${id}/copy]`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 800);
  });
};

// --- Department Service ---

export const getDepartments = async (): Promise<any[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...MOCK_DEPARTMENTS]);
    }, 600);
  });
};

export const createDepartment = async (data: any): Promise<boolean> => {
  console.log("Calling Backend API [POST /api/departments] with data:", data);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 1000);
  });
};

export const updateDepartment = async (id: string, data: any): Promise<boolean> => {
  console.log(`Calling Backend API [PUT /api/departments/${id}] with data:`, data);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 1000);
  });
};

export const deleteDepartment = async (id: string): Promise<boolean> => {
  console.log(`Calling Backend API [DELETE /api/departments/${id}]`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 800);
  });
};

// --- Developer Service ---

export const getDevelopers = async (): Promise<any[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...MOCK_DEVELOPERS]);
    }, 600);
  });
};

export const createDeveloper = async (data: any): Promise<boolean> => {
  console.log("Calling Backend API [POST /api/developers] with data:", data);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 1000);
  });
};

export const updateDeveloper = async (id: string, data: any): Promise<boolean> => {
  console.log(`Calling Backend API [PUT /api/developers/${id}] with data:`, data);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 1000);
  });
};

export const deleteDeveloper = async (id: string): Promise<boolean> => {
  console.log(`Calling Backend API [DELETE /api/developers/${id}]`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 800);
  });
};