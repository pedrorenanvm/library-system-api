export interface ICreateReservedTitle {
  titleId: string;
  teacherId: string;
  disciplineName: string;
  startsAt: Date;
  endsAt: Date;
  inLibraryOnly: boolean;
}