import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import {
	ApiBearerAuth,
	ApiOperation,
	ApiParam,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import { CurrentUser } from "../common/decorator/current-user.decorator";
import { JwtAuthGuard } from "../common/gaurds/jwt-auth.guard";
import { PermissionEntity } from "./entities/permission.entity";
import { RoleService } from "./role.service";

@ApiTags("Permissions")
@Controller("organizations/:organizationId/permissions")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PermissionController {
	constructor(private readonly roleService: RoleService) {}

	@Get()
	@ApiOperation({ summary: "List the global permission registry" })
	@ApiParam({ name: "organizationId", description: "Organization ID" })
	@ApiResponse({ status: 200, type: PermissionEntity, isArray: true })
	list(
		@Param("organizationId") organizationId: string,
		@CurrentUser("id") userId: string,
	) {
		return this.roleService.listPermissionsInOrg(organizationId, userId);
	}
}