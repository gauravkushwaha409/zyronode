/**
 * Mirrors the payloads from apps/server VisitorController. Field names are
 * camelCase to match Prisma/Nest - do not reintroduce snake_case here.
 */

export type VisitorStatus = "NEW" | "REVIEWED" | "CONVERTED" | "IGNORED";
export type VisitorDeviceType = "desktop" | "mobile" | "tablet";

export interface VisitorConversationRef {
	id: string;
}

/** Row shape returned by GET /visitors (VISITOR_LIST_SELECT + conversations). */
export interface VisitorListItem {
	id: string;
	externalId: string | null;
	name: string | null;
	email: string | null;
	phone: string | null;
	ipAddress: string | null;
	status: VisitorStatus;
	visitCount: number;
	isIdentified: boolean;
	isOnline: boolean;
	currentPage: string | null;
	activeDuration: number;
	lastSeenAt: string | null;
	device: string | null;
	deviceType: string | null;
	browser: string | null;
	os: string | null;
	country: string | null;
	countryCode: string | null;
	city: string | null;
	region: string | null;
	regionName: string | null;
	timezone: string | null;
	latitude: number | null;
	longitude: number | null;
	assignedAgentId: string | null;
	createdAt: string;
	updatedAt: string;
	conversations: VisitorConversationRef[];
}

export interface VisitorListData {
	data: VisitorListItem[];
	total: number;
	nextCursor: string | null;
	hasMore: boolean;
}

export interface VisitorListParams {
	limit?: number;
	cursor?: string;
	country?: string;
	deviceType?: VisitorDeviceType;
	isOnline?: boolean;
	search?: string;
}

export interface VisitorAgent {
	id: string;
	firstName: string | null;
	lastName: string | null;
	email: string;
	profile?: string | null;
}

export interface VisitorNote {
	id: string;
	content: string;
	createdAt: string;
	updatedAt?: string;
	author: VisitorAgent | null;
}

export interface VisitorPageVisit {
	id: string;
	url: string;
	pageTitle: string | null;
	enteredAt: string;
	leftAt: string | null;
	durationSeconds: number;
}

export interface VisitorConversationSummary {
	id: string;
	status: string;
	channel: string;
	createdAt: string;
	updatedAt: string;
	messageCount: number;
	lastMessage: {
		content: string;
		senderType: "VISITOR" | "AGENT" | "SYSTEM";
		createdAt: string;
	} | null;
}

/** GET /visitors/:visitorId */
export interface VisitorInfo extends Omit<VisitorListItem, "conversations"> {
	sourceUrl: string | null;
	utmSource: string | null;
	utmMedium: string | null;
	utmCampaign: string | null;
	assignedAgent: VisitorAgent | null;
	conversations: VisitorConversationSummary[];
	pageVisits: VisitorPageVisit[];
	notes: VisitorNote[];
}

export interface VisitorStatCards {
	online: number;
	today: number;
	identified: number;
	total: number;
	avgActiveDuration: number;
}

export interface VisitorByCountryItem {
	country: string;
	countryCode: string | null;
	count: number;
	percentage: number;
}

export interface VisitorByCountryData {
	countries: VisitorByCountryItem[];
	total: number;
}

export interface VisitorTopPageItem {
	url: string;
	count: number;
	percentage: number;
}

export interface VisitorTopPagesData {
	pages: VisitorTopPageItem[];
	total: number;
}

export interface VisitorCountryOption {
	country: string | null;
	countryCode: string | null;
}

export interface UpdateVisitorDetailsPayload {
	name?: string;
	email?: string;
	phone?: string;
	status?: VisitorStatus;
}

export interface AssignVisitorAgentPayload {
	agentId: string | null;
}

export interface CreateVisitorNotePayload {
	content: string;
}
