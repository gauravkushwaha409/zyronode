import { useQuery } from "@package/query";
import { CONFIG } from "@/config";
import { inboxApiService } from "../../services/inbox-api.service";

export function useUnreadStatsQuery() {
	return useQuery(CONFIG.QUERY_KEY.INBOX.UNREAD_STATS, () => inboxApiService.unreadStats(), undefined, {
		refetchOnMount: true,
	});
}
