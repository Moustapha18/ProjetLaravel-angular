export type Role = 'ADMIN' | 'MANAGER' | 'EMPLOYE' | 'CLIENT' | '' | null;
export interface LoginRequest { email: string; password: string; }
export interface LoginResponse { token: string; data: {
  must_change_password: any; id:number; name:string; email:string; role: Role 
}; }