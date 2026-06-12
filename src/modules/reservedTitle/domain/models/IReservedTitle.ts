export interface IReservedTitle {
  id: string;
  titleId: string;
  teacherId: string;
  disciplineName: string;
  startsAt: Date;
  endsAt: Date;
  inLibraryOnly: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}