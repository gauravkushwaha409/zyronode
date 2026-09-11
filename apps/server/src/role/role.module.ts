import { Module } from "@nestjs/common";
import { PermissionController } from "./permission.controller";
import { RoleController } from "./role.controller";
import { RoleSeedService } from "./role-seed.service";
import { RoleService } from "./role.service";

@Module({
	controllers: [RoleController, PermissionController],
	providers: [RoleService, RoleSeedService],
})
export class RoleModule {}