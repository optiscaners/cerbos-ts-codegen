/**
 * This file aims only at trying out typescript errors and hints
 * */
import { HTTP } from "@cerbos/http";

export const cerbos = new HTTP(process.env.NEXT_PUBLIC_CERBOS_ENDPOINT || "");

cerbos.isAllowed({
	action: "read",
	principal: { id: "123", roles: [""] },
	resource: { kind: "business_partner", id: "foo" },
});

cerbos.isAllowed({
	action: "show",
	principal: { id: "123", roles: [""], attributes: { department: "legal" } },
	resource: { kind: "vdp_menu", id: "foo" },
});
