import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	UseGuards,
} from "@nestjs/common";
import { CurrentUser } from "../common/decorator/current-user.decorator";
import { JwtAuthGuard } from "../common/gaurds/jwt-auth.guard";
import { CreateOrganizationDto } from "./dto/create-organization.dto";
import { UpdateOrganizationDto } from "./dto/update-organization.dto";
import { OrganizationService } from "./organization.service";

@Controller("organization")
export class OrganizationController {
	constructor(private readonly organizationService: OrganizationService) {}

	@Post()
	@UseGuards(JwtAuthGuard)
	create(
		@Body() dto: CreateOrganizationDto,
		@CurrentUser("id") userId: string,
	) {
		return this.organizationService.create(dto, userId);
	}

	@Get("my")
	@UseGuards(JwtAuthGuard)
	getMyOrganizations(@CurrentUser("id") userId: string) {
		return this.organizationService.getMyOrganizations(userId);
	}

	@Get()
	findAll() {
		return this.organizationService.findAll();
	}

	/**
	 * Members of one organization - used to populate assignee pickers.
	 * Declared before ":id" so the static segment is not swallowed.
	 */
	@Get(":organizationId/members")
	@UseGuards(JwtAuthGuard)
	getMembers(
		@Param("organizationId") organizationId: string,
		@CurrentUser("id") userId: string,
	) {
		return this.organizationService.getMembers(organizationId, userId);
	}

	@Get(":id")
	findOne(@Param("id") id: string) {
		return this.organizationService.findOne(+id);
	}

	@Patch(":id")
	update(
		@Param("id") id: string,
		@Body() updateOrganizationDto: UpdateOrganizationDto,
	) {
		return this.organizationService.update(+id, updateOrganizationDto);
	}

	@Delete(":id")
	remove(@Param("id") id: string) {
		return this.organizationService.remove(+id);
	}
}
