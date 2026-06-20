import type { SVGProps } from 'react';
const VideoCall = (props: SVGProps<SVGSVGElement>) => (
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
      d="M2.75195 6.74854C2.75195 5.64397 3.64738 4.74854 4.75195 4.74854H13.252C14.3566 4.74854 15.252 5.64397 15.252 6.74854V17.2485C15.252 18.3531 14.3566 19.2485 13.252 19.2485H4.75195C3.64738 19.2485 2.75195 18.3531 2.75195 17.2485V6.74854Z"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M15.248 10.0004L19.8008 7.72405C20.4657 7.3916 21.248 7.87509 21.248 8.61847V15.3824C21.248 16.1257 20.4657 16.6092 19.8008 16.2768L15.248 14.0004V10.0004Z"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

export default VideoCall;
