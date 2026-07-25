import { Injectable, Logger } from "@nestjs/common";
import { Server } from "socket.io";

@Injectable()
export class EventBridge {
  private readonly logger = new Logger(EventBridge.name);
  private server: Server | null = null;

  setServer(server: Server) {
    this.server = server;
  }

  emitToSession(sessionId: string, event: string, data: Record<string, unknown>) {
    if (!this.server) {
      this.logger.warn("Server not set, cannot emit event");
      return;
    }
    this.server.to(`session:${sessionId}`).emit(event, data);
  }

  emitToOrg(organizationId: string, event: string, data: Record<string, unknown>) {
    if (!this.server) {
      this.logger.warn("Server not set, cannot emit event");
      return;
    }
    this.server.to(`org:${organizationId}`).emit(event, data);
  }
}
