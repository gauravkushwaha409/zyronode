import { Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { MessageService } from "../message/message.service";
import { SessionService } from "../session/session.service";

interface AuthPayload {
  id: string;
}

interface SendMessagePayload {
  sessionId: string;
  content: string;
  messageType?: "TEXT" | "FILE" | "INTERNAL_NOTE";
  replyToId?: string;
}

interface TypingPayload {
  sessionId: string;
}

@WebSocketGateway({
  cors: {
    origin: ["http://localhost:3000"],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly messageService: MessageService,
    private readonly sessionService: SessionService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ??
        client.handshake.headers?.authorization?.replace("Bearer ", "");

      if (token) {
        try {
          const payload = await this.jwtService.verifyAsync<AuthPayload>(token);
          client.data.user = { id: payload.id, type: "AGENT" as const };
          this.logger.log(`Agent connected: ${payload.id} (${client.id})`);
        } catch {
          client.data.user = { type: "VISITOR" as const };
          this.logger.log(`Visitor connected (no valid token): ${client.id}`);
        }
      } else {
        client.data.user = { type: "VISITOR" as const };
        this.logger.log(`Visitor connected: ${client.id}`);
      }
    } catch (err) {
      this.logger.error(`Connection error: ${err}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage("session:join")
  async handleSessionJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string },
  ) {
    const room = `session:${data.sessionId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined room ${room}`);
    return { event: "session:joined", data: { sessionId: data.sessionId } };
  }

  @SubscribeMessage("agent:join")
  async handleAgentJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { organizationId: string },
  ) {
    const user = client.data.user;
    if (user?.type !== "AGENT") {
      return { event: "error", data: { message: "Unauthorized" } };
    }

    const room = `org:${data.organizationId}`;
    client.join(room);
    this.logger.log(`Agent ${user.id} joined org room ${room}`);
    return { event: "agent:joined", data: { organizationId: data.organizationId } };
  }

  @SubscribeMessage("message:send")
  async handleMessageSend(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SendMessagePayload,
  ) {
    const user = client.data.user;
    const senderType = user?.type ?? "VISITOR";
    const senderId = user?.type === "AGENT" ? user.id : undefined;

    const result = await this.messageService.create(
      data.sessionId,
      {
        content: data.content,
        messageType: data.messageType ?? "TEXT",
        replyToId: data.replyToId,
      },
      senderType,
      senderId,
    );

    const room = `session:${data.sessionId}`;
    this.server.to(room).emit("message:new", {
      session: { id: data.sessionId },
      message: result.data,
    });

    const session = await this.sessionService.findById(data.sessionId);
    if (session.data?.organizationId) {
      this.server
        .to(`org:${session.data.organizationId}`)
        .emit("message:new", {
          session: session.data,
          message: result.data,
        });
    }

    return { event: "message:sent", data: result.data };
  }

  @SubscribeMessage("typing:start")
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: TypingPayload,
  ) {
    const user = client.data.user;
    const room = `session:${data.sessionId}`;
    client.to(room).emit("typing:update", {
      sessionId: data.sessionId,
      senderType: user?.type ?? "VISITOR",
      isTyping: true,
    });
  }

  @SubscribeMessage("typing:stop")
  handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: TypingPayload,
  ) {
    const user = client.data.user;
    const room = `session:${data.sessionId}`;
    client.to(room).emit("typing:update", {
      sessionId: data.sessionId,
      senderType: user?.type ?? "VISITOR",
      isTyping: false,
    });
  }

  @SubscribeMessage("session:status")
  async handleSessionStatus(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string; status: string },
  ) {
    const user = client.data.user;
    if (user?.type !== "AGENT") {
      return { event: "error", data: { message: "Unauthorized" } };
    }

    const result = await this.sessionService.updateStatus(
      data.sessionId,
      data.status as "ACTIVE" | "IDLE" | "CLOSED" | "PENDING",
    );

    const room = `session:${data.sessionId}`;
    this.server.to(room).emit("session:updated", { session: result.data });

    if (result.data?.organizationId) {
      this.server
        .to(`org:${result.data.organizationId}`)
        .emit("session:updated", { session: result.data });
    }

    return { event: "session:status:updated", data: result.data };
  }
}
