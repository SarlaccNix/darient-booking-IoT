import { IsDateString, IsEmail, IsString, Matches } from 'class-validator';

// Matches ISO 8601 datetimes whose minutes are exactly :00 or :30 and seconds are :00
// e.g. 2025-06-10T14:30:00.000Z ✓  2025-06-10T14:31:00.000Z ✗
const HALF_HOUR_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:(00|30):00(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;
const HALF_HOUR_MSG = 'Booking times must be on a 30-minute boundary (HH:00 or HH:30)';

export class CreateBookingDto {
  @IsString()
  spaceId: string;

  @IsEmail()
  clientEmail: string;

  @IsDateString()
  bookingDate: string;

  @IsDateString()
  @Matches(HALF_HOUR_REGEX, { message: HALF_HOUR_MSG })
  startTime: string;

  @IsDateString()
  @Matches(HALF_HOUR_REGEX, { message: HALF_HOUR_MSG })
  endTime: string;
}
