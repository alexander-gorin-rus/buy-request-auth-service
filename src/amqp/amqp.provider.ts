import * as path from 'path';
import * as fs from 'fs';
import * as protobuf from 'protobufjs';
import { Buffer, Message, Root } from 'protobufjs';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

const PROTOBUF_DIR = path.resolve('./src/protos');

@Injectable()
export class AmqpProvider implements OnModuleInit {
  private root: Root;
  async onModuleInit() {
    this.root = await this.loadProtoFiles();
  }

  private readonly logger = new Logger();
  loadProtoFiles(): Promise<Root> {
    const protoFiles = [];
    const serviceFolders = fs.readdirSync(PROTOBUF_DIR);
    if (!serviceFolders.length) {
      return null;
    }
    serviceFolders.forEach((serviceFolder) => {
      const files = fs.readdirSync(`${PROTOBUF_DIR}/${serviceFolder}`);
      files.forEach((file) => {
        if (path.extname(file) === '.proto') {
          protoFiles.push(`${PROTOBUF_DIR}/${serviceFolder}/${file}`);
        }
      });
    });
    const root = new protobuf.Root();
    root.resolvePath = (origin, target) => {
      if (path.isAbsolute(target)) {
        return target;
      }
      return `${PROTOBUF_DIR}/${target}`;
    };
    return new Promise((resolve, reject) => {
      root.load(protoFiles, (err, updatedRoot) => {
        if (err) {
          reject(err);
          return;
        }
        this.logger.log('<Amqp> Loaded protobuf files for RabbitMQ');
        resolve(updatedRoot);
      });
    });
  }

  decodeMessage<R>(type: string | string[], buffer: Buffer): Message<R | any> {
    const Type = this.root.lookupType(type);
    return Type.decode(buffer);
  }

  encodeMessage<D>(
    type: string | string[],
    data: D,
  ): { message: Message; buffer: Buffer } {
    const Type = this.root.lookupType(type);
    const msg = Type.create(data);
    return {
      message: msg,
      buffer: Type.encode(msg).finish(),
    };
  }
}
