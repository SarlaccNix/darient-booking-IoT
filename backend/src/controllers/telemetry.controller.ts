import { Controller, Get, Param, Query, Res, Sse } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import type { Response } from 'express';
import { TelemetryService } from '../services/telemetry.service';
import { TelemetryQueryDto } from '../dto/telemetry/telemetry-query.dto';
import { Public } from '../common/decorators/public.decorator';

interface MessageEvent {
  data: string;
}

@Controller('telemetry')
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Get()
  findLatestAll() {
    return this.telemetryService.findLatestAll();
  }

  // SSE must be declared before /:spaceId routes to avoid routing conflict
  @Public()
  @Sse('stream')
  stream(@Res() res: Response): Observable<MessageEvent> {
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Accel-Buffering', 'no');

    return this.telemetryService.telemetry$.pipe(
      map((payload) => ({ data: JSON.stringify(payload) })),
    );
  }

  @Get(':spaceId/latest')
  findLatest(@Param('spaceId') spaceId: string) {
    return this.telemetryService.findLatest(spaceId);
  }

  @Get(':spaceId/history')
  findHistory(@Param('spaceId') spaceId: string, @Query() query: TelemetryQueryDto) {
    return this.telemetryService.findHistory(spaceId, query.page, query.pageSize);
  }
}
