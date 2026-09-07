import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    companyId: number;
  }

  interface Session {
    user: {
      id: string;
      companyId: number;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    companyId: number;
  }
}
