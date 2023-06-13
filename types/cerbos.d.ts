import type {
	Principal,
	IsAllowedRequest,
} from "@cerbos/core/lib/types/external";

declare module "@cerbos/http" {
	interface HTTP {
		isAllowed(request: isAllowedParams): Promise<boolean>;
	}
	export interface Fleet {
		businessPartner: string;
		owner?: string[];
		custom_attributes?: {
			/**
			 * This interface was referenced by `undefined`'s JSON-Schema definition
			 * via the `patternProperty` ".".
			 */
			[k: string]: string[];
		};
		[k: string]: unknown;
	}
	export interface BusinessPartner {
		department: "tech" | "legal";
		businessPartners: {
			/**
			 * This interface was referenced by `undefined`'s JSON-Schema definition
			 * via the `patternProperty` ".".
			 */
			[k: string]: {
				role?: "owner" | "member" | "fleetEditor";
				custom_attributes?: {
					all?: boolean;
					attributes?: {
						/**
						 * This interface was referenced by `undefined`'s JSON-Schema definition
						 * via the `patternProperty` ".".
						 */
						[k: string]: string[];
					};
					[k: string]: unknown;
				};
				[k: string]: unknown;
			};
		};
		[k: string]: unknown;
	}
	export interface Department {
		department: "tech" | "legal";
		[k: string]: unknown;
	}
	export interface VdpCheck {
		businessPartner: string;
		[k: string]: unknown;
	}
	export interface Vehicle {
		businessPartner: string;
		[k: string]: unknown;
	}

	type isAllowedParamsBusinessPartner = {
		principal: Principal & {
			attributes?: BusinessPartner;
		};
		resource: { kind: "business_partner" };
		action: "*" | "read" | "update";
	};
	type isAllowedParamsFleet = {
		principal: Principal & {
			attributes?: BusinessPartner;
		};
		resource: { kind: "fleet"; attributes: Fleet };
		action: "read" | "update" | "*" | "create" | "delete";
	};
	type isAllowedParamsFleetAttribute = {
		principal: Principal;
		resource: { kind: "fleet_attribute" };
		action: "read" | "*";
	};
	type isAllowedParamsSignalPrivacy = {
		principal: Principal;
		resource: { kind: "signal:privacy" };
		action: "read" | "update";
	};
	type isAllowedParamsUiMenu = {
		principal: Principal & {
			attributes?: Department;
		};
		resource: { kind: "vdp_menu" };
		action: "show";
	};
	type isAllowedParamsVdpCheck = {
		principal: Principal & {
			attributes?: BusinessPartner;
		};
		resource: { kind: "vdp_check"; attributes: VdpCheck };
		action: "*" | "create" | "read" | "deny" | "approve";
	};
	type isAllowedParamsVehicle = {
		principal: Principal & {
			attributes?: BusinessPartner;
		};
		resource: { kind: "vehicle"; attributes: Fleet };
		action: "read:*" | "update" | "create" | "read:vin" | "delete";
	};
	type isAllowedParams = IsAllowedRequest &
		(
			| isAllowedParamsBusinessPartner
			| isAllowedParamsFleet
			| isAllowedParamsFleetAttribute
			| isAllowedParamsSignalPrivacy
			| isAllowedParamsUiMenu
			| isAllowedParamsVdpCheck
			| isAllowedParamsVehicle
		);
}
