import type {
	Principal,
	IsAllowedRequest,
} from "@cerbos/core/lib/types/external"

declare module "@cerbos/http" {
	interface HTTP {
		isAllowed(request: isAllowedParams): Promise<boolean>
	}
	export interface Dataset {
		fleet: string
		fleetGroups: string[]
		[k: string]: unknown
	}
	export interface Fleet {
		fleetGroups: string[]
		[k: string]: unknown
	}
	export interface Principal {
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
	export interface SignalDefinition {
		fleet: string
		fleetGroup: string
		[k: string]: unknown
	}
	export interface VdpCheck {
		fleet: string
		fleetGroups: string[]
		[k: string]: unknown
	}
	export interface Vehicle {
		fleet: string
		fleetGroups: string[]
		[k: string]: unknown
	}

	type isAllowedParamsDataset = {
		principal: Principal & {
			attributes?: Principal
		}
		resource: { kind: "dataset"; attributes: Dataset }
		action: "read" | "add" | "create" | "update" | "remove" | "*"
	}
	type isAllowedParamsFleet = {
		principal: Principal & {
			attributes?: Principal
		}
		resource: { kind: "fleet"; attributes: Fleet }
		action: "read" | "*" | "create" | "create:without_group" | "update"
	}
	type isAllowedParamsFleetAttribute = {
		principal: Principal
		resource: { kind: "fleet_attribute" }
		action: "read" | "create" | "delete"
	}
	type isAllowedParamsFleetGroup = {
		principal: Principal & {
			attributes?: Principal
		}
		resource: { kind: "fleet_group" }
		action: "*" | "read" | "update"
	}
	type isAllowedParamsRightsAssignment = {
		principal: Principal & {
			attributes?: Principal
		}
		resource: { kind: "rights_assignment" }
		action: "read" | "*"
	}
	type isAllowedParamsSignalDefinition = {
		principal: Principal & {
			attributes?: Principal
		}
		resource: { kind: "signal_definition"; attributes: SignalDefinition }
		action: "read" | "add" | "update" | "remove" | "*"
	}
	type isAllowedParamsSignalPrivacy = {
		principal: Principal & {
			attributes?: Principal
		}
		resource: { kind: "signal_privacy" }
		action: "read" | "update" | "*"
	}
	type isAllowedParamsUiMenu = {
		principal: Principal & {
			attributes?: Principal
		}
		resource: { kind: "vdp_menu" }
		action: "show"
	}
	type isAllowedParamsVdpCheck = {
		principal: Principal & {
			attributes?: Principal
		}
		resource: { kind: "vdp_check"; attributes: VdpCheck }
		action: "create" | "read" | "update:add_comment" | "update:status" | "*"
	}
	type isAllowedParamsVehicle = {
		principal: Principal & {
			attributes?: Principal
		}
		resource: { kind: "vehicle"; attributes: Vehicle }
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
			| isAllowedParamsDataset
			| isAllowedParamsFleet
			| isAllowedParamsFleetAttribute
			| isAllowedParamsFleetGroup
			| isAllowedParamsRightsAssignment
			| isAllowedParamsSignalDefinition
			| isAllowedParamsSignalPrivacy
			| isAllowedParamsUiMenu
			| isAllowedParamsVdpCheck
			| isAllowedParamsVehicle
		)
}
