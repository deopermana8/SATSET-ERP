export type DstVersion = "1.0";

export type DstDefaultValue = string | number | boolean | null;

export interface DstFieldSpec {
	name: string;
	type: string;
	required: boolean;
	unique?: boolean;
	default?: DstDefaultValue;
	description?: string;
}

export interface DstDomainSpec {
	name: string;
	description?: string;
}

export interface DstGeneratorConfig {
	prisma?: boolean;
	route?: boolean;
	repository?: boolean;
	service?: boolean;
	controller?: boolean;
	dto?: boolean;
	validator?: boolean;
	api?: boolean;
	openapi?: boolean;
}

export interface DstCustomerSpec {
	version: DstVersion;
	domain: DstDomainSpec;
	fields: DstFieldSpec[];
	softDelete?: boolean;
	generators?: DstGeneratorConfig;
}

export type DstSpec = DstCustomerSpec;
export type DstSpecification = DstSpec;

export interface DstValidationIssue {
	path: string;
	message: string;
}

export interface DstValidationResult {
	valid: boolean;
	issues: DstValidationIssue[];
}
