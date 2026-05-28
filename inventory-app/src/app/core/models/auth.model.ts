export interface LoginRequest{
    email: string;
    password: string;
}

export interface RegisterRequest{
    username: string;
    email: string;
    password: string;
    roleId: number;
}

export interface AuthResponse{
    token: string;
    username: string;
    email: string;
    role: string;
    expiry: string;
}