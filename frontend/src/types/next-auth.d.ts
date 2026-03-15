import "next-auth";

declare module "next-auth" {
  interface User {
    provider?: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      provider?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    provider?: string;
  }
}
