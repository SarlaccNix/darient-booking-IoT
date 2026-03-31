import { Module } from '@nestjs/common';
import { TelemetryController } from '../controllers/telemetry.controller';
import { TelemetryService } from '../services/telemetry.service';
import { MqttService } from '../services/mqtt.service';

@Module({
  controllers: [TelemetryController],
  providers: [TelemetryService, MqttService],
})
export class TelemetryModule {}
