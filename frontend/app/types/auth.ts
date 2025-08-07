// TypeScript interfaces for allauth API responses based on OpenAPI schema

export interface AllauthUser {
  id: number | string
  display: string
  has_usable_password: boolean
  email: string
  username?: string
}

export interface AllauthError {
  code: string
  param?: string
  message: string
}

export interface AllauthErrorResponse {
  status: 400
  errors: AllauthError[]
}

export interface AllauthFlow {
  id: 'login' | 'mfa_authenticate' | 'mfa_reauthenticate' | 'provider_redirect' | 
      'provider_signup' | 'provider_token' | 'reauthenticate' | 'signup' | 
      'verify_email' | 'verify_phone' | 'login_by_code'
  is_pending?: boolean
  provider?: any
}

export interface AllauthAuthenticationMeta {
  is_authenticated: boolean
  session_token?: string
  access_token?: string
}

export interface AllauthAuthenticationResponse {
  status: 401
  data: {
    flows: AllauthFlow[]
    user?: AllauthUser
    methods?: Array<{
      method: string
      at: number
      email?: string
    }>
  }
  meta: AllauthAuthenticationMeta
}

export interface AllauthAuthenticatedResponse {
  status: 200
  data: {
    user: AllauthUser
    methods: Array<{
      method: string
      at: number
      email?: string
    }>
  }
  meta: AllauthAuthenticationMeta
}

export interface AllauthStatusResponse {
  status: 200
}

export interface AllauthConflictResponse {
  status: 409
}

export type AllauthApiResponse = 
  | AllauthAuthenticatedResponse 
  | AllauthAuthenticationResponse 
  | AllauthErrorResponse
  | AllauthStatusResponse
  | AllauthConflictResponse

// Custom error class for allauth API errors
export class AllauthApiError extends Error {
  constructor(
    public response: AllauthErrorResponse,
    public originalError?: any
  ) {
    super(response.errors[0]?.message || 'API Error')
    this.name = 'AllauthApiError'
  }

  get fieldErrors() {
    return this.response.errors.reduce((acc, error) => {
      if (error.param) {
        acc[error.param] = error.message
      }
      return acc
    }, {} as Record<string, string>)
  }

  get firstError() {
    return this.response.errors[0]
  }
}