import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Res,
	UseGuards,
} from "@nestjs/common";
import {
	ApiBearerAuth,
	ApiOperation,
	ApiParam,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import type { Response } from "express";
import { CurrentUser } from "../common/decorator/current-user.decorator";
import { JwtAuthGuard } from "../common/gaurds/jwt-auth.guard";
import { CreateOrganizationDto } from "./dto/create-organization.dto";
import { SwitchOrganizationDto } from "./dto/switch-organization.dto";
import { UpdateOrganizationDto } from "./dto/update-organization.dto";
import { OrganizationService } from "./organization.service";

@ApiTags("Organization")
@Controller("organization")
export class OrganizationController {
	constructor(private readonly organizationService: OrganizationService) {}

	@Post()
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: "Create a new organization" })
	@ApiResponse({ status: 201, description: "Organization created" })
	create(@Body() dto: CreateOrganizationDto, @CurrentUser("id") userId: string) {
		return this.organizationService.create(dto, userId);
	}

	@Get("my")
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: "Get current user organizations" })
	@ApiResponse({ status: 200, description: "Organizations returned" })
	getMyOrganizations(@CurrentUser("id") userId: string) {
		return this.organizationService.getMyOrganizations(userId);
	}

	@Post("switch")
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: "Switch the current organization" })
	@ApiParam({ name: "organizationId", description: "Organization ID to switch to" })
	@ApiResponse({ status: 200, description: "Organization switched" })
	@ApiResponse({ status: 403, description: "User is not a member of this organization" })
	switchOrganization(
		@Body() dto: SwitchOrganizationDto,
		@CurrentUser("id") userId: string,
		@Res({ passthrough: true }) response: Response,
	) {
		return this.organizationService.switchOrganization(
			userId,
			dto.organizationId,
			response,
		);
	}

	@Get()
	@ApiOperation({ summary: "List all organizations" })
	@ApiResponse({ status: 200, description: "Organizations returned" })
	findAll() {
		return this.organizationService.findAll();
	}

	@Get(":organizationId/members")
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: "Get members of an organization" })
	@ApiParam({ name: "organizationId", description: "Organization ID" })
	@ApiResponse({ status: 200, description: "Members returned" })
	getMembers(
		@Param("organizationId") organizationId: string,
		@CurrentUser("id") userId: string,
	) {
		return this.organizationService.getMembers(organizationId, userId);
	}

	@Get(":id")
	@ApiOperation({ summary: "Get organization by ID" })
	@ApiParam({ name: "id", description: "Organization ID" })
	@ApiResponse({ status: 200, description: "Organization returned" })
	@ApiResponse({ status: 404, description: "Organization not found" })
	findOne(@Param("id") id: string) {
		return this.organizationService.findOne(+id);
	}

	@Patch(":id")
	@ApiOperation({ summary: "Update organization" })
	@ApiParam({ name: "id", description: "Organization ID" })
	@ApiResponse({ status: 200, description: "Organization updated" })
	update(
		@Param("id") id: string,
		@Body() updateOrganizationDto: UpdateOrganizationDto,
	) {
		return this.organizationService.update(+id, updateOrganizationDto);
	}

	@Delete(":id")
	@ApiOperation({ summary: "Delete organization" })
	@ApiParam({ name: "id", description: "Organization ID" })
	@ApiResponse({ status: 200, description: "Organization deleted" })
	remove(@Param("id") id: string) {
		return this.organizationService.remove(+id);
	}
}
