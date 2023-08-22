import type {
	Principal,
	IsAllowedRequest,
} from "@cerbos/core/lib/types/external"

declare module "@cerbos/http" {
	interface HTTP {
		isAllowed(request: isAllowedParams): Promise<boolean>
	}
	export interface DatasetAttributes {
		fleet: string
		fleetGroups: string[]
		[k: string]: unknown
	}
	export interface FleetAttributes {
		fleetGroups: string[]
		[k: string]: unknown
	}
	export interface PrincipalAttributes {
		department: "tech" | "legal"
		fleetGroups: {
			/**
			 * This interface was referenced by `undefined`'s JSON-Schema definition
			 * via the `patternProperty` ".".
			 */
			[k: string]: {
				role?: "owner" | "member"
				[k: string]: unknown
			}
		}
		fleets?: {
			/**
			 * This interface was referenced by `undefined`'s JSON-Schema definition
			 * via the `patternProperty` ".".
			 */
			[k: string]: {
				role?: "editor"
				[k: string]: unknown
			}
		}
		[k: string]: unknown
	}
	export interface SignalDefinitionAttributes {
		fleet: string
		fleetGroup: string
		[k: string]: unknown
	}
	export interface VdpCheckAttributes {
		fleet: string
		fleetGroups: string[]
		[k: string]: unknown
	}
	export interface VehicleAttributes {
		fleet: string
		fleetGroups: string[]
		[k: string]: unknown
	}

	type isAllowedParamsDatasetAttributes = {
		principal: Principal & {
			attributes?: PrincipalAttributes
		}
		resource: { kind: "dataset"; attributes: DatasetAttributes }
		action: "read" | "add" | "create" | "update" | "remove" | "*"
	}
	type isAllowedParamsFleetAttributes = {
		principal: Principal & {
			attributes?: PrincipalAttributes
		}
		resource: { kind: "fleet"; attributes: FleetAttributes }
		action: "read" | "*" | "create" | "create:without_group" | "update"
	}
	type isAllowedParamsFleetAttributeAttributes = {
		principal: Principal
		resource: { kind: "fleet_attribute" }
		action: "read" | "create" | "delete"
	}
	type isAllowedParamsFleetGroupAttributes = {
		principal: Principal & {
			attributes?: PrincipalAttributes
		}
		resource: { kind: "fleet_group" }
		action: "*" | "read" | "update"
	}
	type isAllowedParamsRightsAssignmentAttributes = {
		principal: Principal & {
			attributes?: PrincipalAttributes
		}
		resource: { kind: "rights_assignment" }
		action: "read" | "*"
	}
	type isAllowedParamsSignalDefinitionAttributes = {
		principal: Principal & {
			attributes?: PrincipalAttributes
		}
		resource: {
			kind: "signal_definition"
			attributes: SignalDefinitionAttributes
		}
		action: "read" | "add" | "update" | "remove" | "*"
	}
	type isAllowedParamsSignalPrivacyAttributes = {
		principal: Principal & {
			attributes?: PrincipalAttributes
		}
		resource: { kind: "signal_privacy" }
		action: "read" | "update" | "*"
	}
	type isAllowedParamsUiMenuAttributes = {
		principal: Principal & {
			attributes?: PrincipalAttributes
		}
		resource: { kind: "vdp_menu" }
		action: "show"
	}
	type isAllowedParamsVdpCheckAttributes = {
		principal: Principal & {
			attributes?: PrincipalAttributes
		}
		resource: { kind: "vdp_check"; attributes: VdpCheckAttributes }
		action: "create" | "read" | "update:add_comment" | "update:status" | "*"
	}
	type isAllowedParamsVehicleAttributes = {
		principal: Principal & {
			attributes?: PrincipalAttributes
		}
		resource: { kind: "vehicle"; attributes: VehicleAttributes }
		action:
			| "read:non_sensitive"
			| "update"
			| "create"
			| "read:*"
			| "delete"
			| "*"
	}
	type isAllowedParams = IsAllowedRequest &
		(
			| isAllowedParamsDatasetAttributes
			| isAllowedParamsFleetAttributes
			| isAllowedParamsFleetAttributeAttributes
			| isAllowedParamsFleetGroupAttributes
			| isAllowedParamsRightsAssignmentAttributes
			| isAllowedParamsSignalDefinitionAttributes
			| isAllowedParamsSignalPrivacyAttributes
			| isAllowedParamsUiMenuAttributes
			| isAllowedParamsVdpCheckAttributes
			| isAllowedParamsVehicleAttributes
		)
}
