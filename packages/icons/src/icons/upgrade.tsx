import { useId, type SVGProps } from 'react';

const Upgrade = (props: SVGProps<SVGSVGElement>) => {
  const gradientId = useId();

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <path
        d="M13.9992 2.35634C13.9992 1.12972 12.4165 0.636919 11.7202 1.64668L3.17236 14.041C2.60048 14.8702 3.19407 16.0006 4.20137 16.0006H9.99917V21.6449C9.99917 22.8715 11.5818 23.3644 12.2782 22.3546L20.826 9.96031C21.3979 9.13109 20.8043 8.00065 19.797 8.00065H13.9992V2.35634Z"
        fill={`url(#${gradientId})`}
      />

      <defs>
        <linearGradient
          id={gradientId}
          x1="11.9992"
          y1="1.104"
          x2="11.9992"
          y2="22.8973"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#7C3AED" />
          <stop offset="1" stopColor="#472187" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default Upgrade;
