import 'next-auth'
import 'next-auth/jwt'

type AppRole = 'OWNER' | 'PARTNER' | 'POINT' | 'USER'

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string
      email?: string | null
      name?: string | null
      login?: string | null
      role: AppRole
      partnerId?: string | null
      pointId?: string | null
      mustChangePassword?: boolean
    }
  }
  interface User {
    id: string
    email?: string | null
    name?: string | null
    login?: string | null
    role: AppRole
    partnerId?: string | null
    pointId?: string | null
    mustChangePassword?: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    email?: string | null
    name?: string | null
    login?: string | null
    role?: AppRole
    partnerId?: string | null
    pointId?: string | null
    mustChangePassword?: boolean
  }
}

