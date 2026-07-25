import { Button, Typography } from '@package/ui';
import { AddTags } from './add-tags-accordion';
import { AiInsights } from './ai-insights-accordion';
import { AiSummary } from './ai-summary-accordion';
import { CompanyDetails } from './company-details-accordion';
import { LeadType } from './lead-type-accordion';
import { Notes } from './notes-accordion';
import { UserInformation } from './user-details-accordion';
import { VisitInformation } from './visit-information-accordion';
import { VisitedSites } from './visited-sites-accordion';

export function ConversationDetails() {
  return (
    <div>
      <DetailsHeader />
      <div className="space-y-0">
        <UserInformation />
        <LeadType />
        <AddTags />
        <CompanyDetails />
        <Notes />
        <AiSummary />
        <VisitInformation />
        <VisitedSites />
        <AiInsights />
      </div>
    </div>
  );
}

function DetailsHeader() {
  return (
    <div className="w-full pl-3 pr-2.25 h-13.5 flex items-center justify-between bg-white border-b border-gray-200">
      <Typography.T3 weight="medium" className="text-gray-950">
        Details
      </Typography.T3>
      <Button icon="close" variant="ghost" size="icon-xs" />
    </div>
  );
}
