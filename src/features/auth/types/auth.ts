export type AppAuthUser = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  updatedAt?: Date | string;
};

export type AppAuthSessionMetadata = {
  id: string;
  expiresAt: Date | string;
};

export type AppAuthSession = {
  user: AppAuthUser;
  session: AppAuthSessionMetadata;
};

export type StoredAuthSession = {
  id: string;
  expiresAt: string;
};
