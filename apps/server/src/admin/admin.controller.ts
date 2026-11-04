import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import {
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import { AdminJwtAuthGuard } from "../auth/gaurds/admin-jwt-auth.guard";
import { PlatformAdminGuard } from "../auth/gaurds/platform-admin.guard";
import { AdminService } from "./admin.service";
import { ListAdminQueryDto } from "./dto/list-admin-query.dto";

@ApiTags("Admin")
@ApiBearerAuth()
@UseGuards(AdminJwtAuthGuard, PlatformAdminGuard)
@Controller("admin")
export class AdminController {
	constructor(private readonly adminService: AdminService) {}

	@Get("organizations")
	@ApiOperation({ summary: "List organizations across the platform" })
	@ApiResponse({ status: 200, description: "Organizations returned" })
	listOrganizations(@Query() query: ListAdminQueryDto) {
		return this.adminService.listOrganizations(query);
	}

	@Get("users")
	@ApiOperation({ summary: "List users across the platform" })
	@ApiResponse({ status: 200, description: "Users returned" })
	listUsers(@Query() query: ListAdminQueryDto) {
		return this.adminService.listUsers(query);
	}
}
