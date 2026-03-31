import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { SitesModule } from './modules/sites.module';
import { SpacesModule } from './modules/spaces.module';
import { BookingsModule } from './modules/bookings.module';
import { TelemetryModule } from './modules/telemetry.module';

@Module({
  imports: [PrismaModule, SitesModule, SpacesModule, BookingsModule, TelemetryModule],
})
export class AppModule {}
