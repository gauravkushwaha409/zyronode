import { randomUUID } from "node:crypto";
import {
	BadRequestException,
	Body,
	Controller,
	ForbiddenException,
	Param,
	ParseFilePipeBuilder,
	Post,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
	ApiBearerAuth,
	ApiConsumes,
	ApiOperation,
	ApiParam,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import { CurrentUser } from "../common/decorator/current-user.decorator";
import { JwtAuthGuard } from "../common/gaurds/jwt-auth.guard";
import { PrismaService } from "../prisma/prisma.service";
import { UploadFileDto } from "./dto/upload-file.dto";
import { S3Service } from "./s3.service";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

@ApiTags("Uploads")
@Controller("conversations/:conversationId/uploads")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadsController {
	constructor(
		private readonly s3: S3Service,
		private readonly prisma: PrismaService,
	) {}

	@Post()
	@UseInterceptors(FileInterceptor("file"))
	@ApiConsumes("multipart/form-data")
	@ApiOperation({
		summary: "Upload a file attachment for a conversation (agent-only)",
	})
	@ApiParam({ name: "conversationId", description: "Conversation ID" })
	@ApiResponse({ status: 201, description: "File uploaded" })
	async upload(
		@Param("conversationId") conversationId: string,
		@Body() dto: UploadFileDto,
		@UploadedFile(
			new ParseFilePipeBuilder()
				.addMaxSizeValidator({ maxSize: MAX_FILE_SIZE_BYTES })
				.build({ fileIsRequired: true }),
		)
		file: Express.Multer.File,
		@CurrentUser("id") userId: string,
	) {
		if (!dto.organizationId) {
			throw new BadRequestException("organizationId is required");
		}
		const membership = await this.prisma.organizationMember.findUnique({
			where: {
				userId_organizationId: { userId, organizationId: dto.organizationId },
			},
		});
		if (!membership) {
			throw new ForbiddenException("You are not a member of this organization");
		}

		const conversation = await this.prisma.conversation.findFirst({
			where: {
				id: conversationId,
				organizationId: dto.organizationId,
				deletedAt: null,
			},
			select: { id: true },
		});
		if (!conversation) {
			throw new BadRequestException("Conversation not found for organization");
		}

		const key = `org/${dto.organizationId}/conversation/${conversationId}/${randomUUID()}-${file.originalname}`;
		const uploaded = await this.s3.putObject({
			key,
			body: file.buffer,
			contentType: file.mimetype,
		});

		return {
			message: "File uploaded successfully",
			data: {
				url: uploaded.url,
				key: uploaded.key,
				filename: file.originalname,
				mimeType: file.mimetype,
				size: file.size,
			},
		};
	}
}
