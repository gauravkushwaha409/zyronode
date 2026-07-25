import { Icon, Typography } from '@package/ui';
import type { IconName } from '@package/icons';

interface UserInformationItemProps {
  icon: IconName;
  label: React.ReactNode | string;
  placeholder: string;
}

function UserInformationItem({ icon, label, placeholder }: UserInformationItemProps) {
  return (
    <div className="px-3 py-1.5 flex items-center gap-x-2.5">
      <Icon name={icon} size={16} className="text-gray-500" />
      {label ? (
        <Typography.T4 weight="medium" className="text-gray-950">
          {label}
        </Typography.T4>
      ) : (
        <Typography.T4 weight="regular" className="text-gray-300">
          {placeholder}
        </Typography.T4>
      )}
    </div>
  );
}

export function UserInformation() {
  return (
    <div className="border-b border-gray-100">
      <div className="px-3 py-2.5">
        <Typography.T5 className="text-gray-600" weight="medium">
          User Information
        </Typography.T5>
      </div>
      <div className="pb-2">
        <UserInformationItem icon="email" label="john@example.com" placeholder="Add email address" />
        <UserInformationItem icon="call" label={null} placeholder="Add phone number" />
        <UserInformationItem icon="location" label={null} placeholder="Add location" />
        <UserInformationItem icon="gmt" label={null} placeholder="Add timezone" />
      </div>
    </div>
  );
}
