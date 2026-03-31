import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as mqtt from 'mqtt';
import { Subject } from 'rxjs';

export interface TelemetryPayload {
  siteId: string;
  spaceId: string;
  ts: string;
  temp_c: number;
  humidity_pct: number;
  co2_ppm: number;
  occupancy: number;
  power_w: number;
}

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttService.name);
  private client: mqtt.MqttClient | null = null;

  readonly telemetry$ = new Subject<TelemetryPayload>();

  onModuleInit() {
    const brokerUrl = process.env.MQTT_BROKER_URL ?? 'mqtt://localhost:1883';
    this.client = mqtt.connect(brokerUrl);

    this.client.on('connect', () => {
      this.logger.log(`Connected to MQTT broker at ${brokerUrl}`);
      this.client!.subscribe('sites/+/offices/+/telemetry', (err) => {
        if (err) this.logger.error('MQTT subscribe error', err.message);
        else this.logger.log('Subscribed to sites/+/offices/+/telemetry');
      });
    });

    this.client.on('message', (topic: string, raw: Buffer) => {
      // topic: sites/{siteId}/offices/{spaceId}/telemetry
      const parts = topic.split('/');
      if (parts.length !== 5) return;
      const siteId = parts[1];
      const spaceId = parts[3];

      try {
        const msg = JSON.parse(raw.toString());
        this.telemetry$.next({ siteId, spaceId, ...msg });
      } catch {
        this.logger.warn(`Bad JSON on topic ${topic}`);
      }
    });

    this.client.on('error', (err) => {
      this.logger.error('MQTT error', err.message);
    });
  }

  onModuleDestroy() {
    this.client?.end();
  }
}
