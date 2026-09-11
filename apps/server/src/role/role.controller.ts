import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Patch,
	Post,
	UseGuards,
} from "@nestjs/common";
import {
	ApiBearerAuth,
	ApiOperation,
	ApiParam,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import { CurrentUser } from "../common/decorator/current-user.decorator";
import { JwtAuthGuard } from "../common/gaurds/jwt-auth.guard";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { RoleEntity } from "./entities/role.entity";
import { RoleService } from "./role.service";

@ApiTags("Roles")
@Controller("organizations/:organizationId/roles")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RoleController {
	constructor(private readonly roleService: RoleService) {}

	@Get()
	@ApiOperation({ summary: "List system and organization custom roles" })
	@ApiParam({ name: "organizationId", description: "Organization ID" })
	@ApiResponse({ status: 200, type: RoleEntity, isArray: true })
	list(
		@Param("organizationId") organizationId: string,
		@CurrentUser("id") userId: string,
	) {
		return this.roleService.listRoles(organizationId, userId);
	}

	@Post()
	@ApiOperation({ summary: "Create a custom role" })
	@ApiParam({ name: "organizationId", description: "Organization ID" })
	@ApiResponse({ status: 201, type: RoleEntity })
	create(
		@Param("organizationId") organizationId: string,
		@CurrentUser("id") userId: string,
		@Body() dto: CreateRoleDto,
	) {
		return this.roleService.createRole(organizationId, userId, dto);
	}

	@Patch(":roleId")
	@ApiOperation({ summary: "Update a custom role (name, description, permissions)" })
	@ApiParam({ name: "organizationId", description: "Organization ID" })
	@ApiParam({ name: "roleId", description: "Role ID" })
	@ApiResponse({ status: 200, type: RoleEntity })
	update(
		@Param("organizationId") organizationId: string,
		@Param("roleId") roleId: string,
		@CurrentUser("id") userId: string,
		@Body() dto: UpdateRoleDto,
	) {
		return this.roleService.updateRole(organizationId, userId, roleId, dto);
	}

	@Delete(":roleId")
	@HttpCode(200)
	@ApiOperation({ summary: "Delete an unassigned custom role" })
	@ApiParam({ name: "organizationId", description: "Organization ID" })
	@ApiParam({ name: "roleId", description: "Role ID" })
	@ApiResponse({ status: 200, description: "Role deleted" })
	remove(
		@Param("organizationId") organizationId: string,
		@Param("roleId") roleId: string,
		@CurrentUser("id") userId: string,
	) {
		return this.roleService.deleteRole(organizationId, userId, roleId);
	}
}