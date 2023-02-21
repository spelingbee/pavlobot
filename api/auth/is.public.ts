import { SetMetadata } from "@nestjs/common";

export const isPublic = (value: boolean): any => SetMetadata("isPublic", value);
