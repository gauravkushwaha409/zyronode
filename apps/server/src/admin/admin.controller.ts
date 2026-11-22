import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Patch,
	Post,
	Query,
	UseGuards,
} from "@nestjs/common";
import {
	ApiBearerAuth,
	ApiOperation,
	ApiParam,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import { AdminJwtAuthGuard } from "../auth/gaurds/admin-jwt-auth.guard";
import { PlatformAdminGuard } from "../auth/gaurds/platform-admin.guard";
import { CurrentUser } from "../common/decorator/current-user.decorator";
import { CreateRoleDto } from "../role/dto/create-role.dto";
import { UpdateRoleDto } from "../role/dto/update-role.dto";
import { AdminService } from "./admin.service";
import { ListAdminQueryDto } from "./dto/list-admin-query.dto";
import { ListRolesQueryDto } from "./dto/list-roles-query.dto";
import { UpdatePlatformRoleDto } from "./dto/update-platform-role.dto";

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

	@Get("roles")
	@ApiOperation({ summary: "List system and custom roles across the platform" })
	@ApiResponse({ status: 200, description: "Roles returned" })
	listRoles(@Query() query: ListRolesQueryDto) {
		return this.adminService.listRoles(query);
	}

	@Get("permissions")
	@ApiOperation({ summary: "List global system permissions" })
	@ApiResponse({ status: 200, description: "Permissions returned" })
	listPermissions() {
		return this.adminService.listPermissions();
	}

	@Post("roles")
	@ApiOperation({ summary: "Create a role from admin" })
	@ApiResponse({ status: 201, description: "Role created" })
	createRole(@Body() dto: CreateRoleDto) {
		return this.adminService.createRole(dto);
	}

	@Patch("roles/:roleId")
	@ApiOperation({ summary: "Update role details and permissions" })
	@ApiParam({ name: "roleId", description: "Role ID" })
	@ApiResponse({ status: 200, description: "Role updated" })
	updateRole(@Param("roleId") roleId: string, @Body() dto: UpdateRoleDto) {
		return this.adminService.updateRole(roleId, dto);
	}

	@Delete("roles/:roleId")
	@HttpCode(200)
	@ApiOperation({ summary: "Delete an unassigned custom role" })
	@ApiParam({ name: "roleId", description: "Role ID" })
	@ApiResponse({ status: 200, description: "Role deleted" })
	deleteRole(@Param("roleId") roleId: string) {
		return this.adminService.deleteRole(roleId);
	}

	@Get("platform-staff")
	@ApiOperation({ summary: "List users with platform roles (staff)" })
	@ApiResponse({ status: 200, description: "Platform staff returned" })
	listPlatformStaff() {
		return this.adminService.listPlatformStaff();
	}

	@Patch("users/:userId/platform-role")
	@ApiOperation({ summary: "Assign or update user platform role (SUPER_ADMIN only)" })
	@ApiParam({ name: "userId", description: "User ID" })
	@ApiResponse({ status: 200, description: "Platform role updated" })
	updateUserPlatformRole(
		@Param("userId") userId: string,
		@Body() dto: UpdatePlatformRoleDto,
		@CurrentUser("id") callerId: string,
	) {
		return this.adminService.updateUserPlatformRole(
			userId,
			dto.roleId,
			callerId,
		);
	}
}
