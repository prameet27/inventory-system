export interface User{
    id: number;
    username: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: string;
}

export interface CreateUserRequest{
    username: string;
    email: string;
    password: string;
    roleId: number;
}

export interface UpdateUserRequest{
    username: string;
    email: string;
    roleId: number;
    isActive: boolean;
}

export interface Role{
    id: number;
    roleName: string;
}