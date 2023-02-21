export class CreateScheduleDto {
  readonly startTime: Date;
  readonly endTime: Date;
  readonly orderId: number;
  readonly categoryId: number;
}
