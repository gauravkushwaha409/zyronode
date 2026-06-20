import type { SVGProps } from 'react';
const ListView = (props: SVGProps<SVGSVGElement>) => (
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
      d="M4.75195 3.74316H13.252C14.3566 3.74316 15.252 4.63856 15.252 5.74316V19.2432"
      strokeWidth="1.995"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11.25 16.2422L15.25 20.2422L19.25 16.2422"
      strokeWidth="1.995"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default ListView;
