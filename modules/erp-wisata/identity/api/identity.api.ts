export interface IdentityApiRequest {
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
}

export interface IdentityApiResponse {
  status: number;
  body: Record<string, unknown>;
}

export interface IdentityApiController {
  login(request: IdentityApiRequest): Promise<IdentityApiResponse>;
  logout(request: IdentityApiRequest): Promise<IdentityApiResponse>;
  register(request: IdentityApiRequest): Promise<IdentityApiResponse>;
  forgotPassword(request: IdentityApiRequest): Promise<IdentityApiResponse>;
  resetPassword(request: IdentityApiRequest): Promise<IdentityApiResponse>;
  changePassword(request: IdentityApiRequest): Promise<IdentityApiResponse>;
  refreshToken(request: IdentityApiRequest): Promise<IdentityApiResponse>;
}

export const IDENTITY_ROUTES: readonly string[] = [
  "POST /identity/login",
  "POST /identity/logout",
  "POST /identity/register",
  "POST /identity/forgot-password",
  "POST /identity/reset-password",
  "POST /identity/change-password",
  "POST /identity/refresh-token",
  "POST /identity/magic-link",
  "POST /identity/sso"
];
