export const REPOSITORY_KEYS = {
  TitleRepository: 'TitleRepository',
  CopyRepository: 'CopyRepository',
  UserRepository: 'UserRepository',
  LoanRepository: 'LoanRepository',
  FineRepository: 'FineRepository',
  LossRepository: 'LossRepository',
  SubscriptionRepository: 'SubscriptionRepository',
  ReservedTitleRepository: 'ReservedTitleRepository',
} as const;

export type RepositoryKey = keyof typeof REPOSITORY_KEYS;
