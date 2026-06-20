import type { SVGProps } from 'react';
const Plus = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    {...props}
  >
    <path
      d="M12 6.75V12M12 12V17.25M12 12H6.75M12 12H17.25"
      strokeWidth="1.995"
      strokeLinecap="round"
    />
  </svg>
);

export default Plus;
