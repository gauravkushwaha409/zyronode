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
	create(@Body() createOrganizationDto: CreateOrganizationDto) {
		return this.organizationService.create(createOrganizationDto);
	}

	@Get()
	findAll() {
		return this.organizationService.findAll();
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
