import type { SVGProps } from 'react';
const Vertical3DotMenu = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currwentColor"
    stroke="currentColor"
    {...props}
  >
    <path
      d="M14 5C14 3.89543 13.1046 3 12 3C10.8954 3 10 3.89543 10 5C10 6.10457 10.8954 7 12 7C13.1046 7 14 6.10457 14 5Z"
      fill="currentColor"
    />
    <path
      d="M14 11.999C14 10.8945 13.1046 9.99902 12 9.99902C10.8954 9.99902 10 10.8945 10 11.999C10 13.1036 10.8954 13.999 12 13.999C13.1046 13.999 14 13.1036 14 11.999Z"
      fill="currentColor"
    />
    <path
      d="M14 19.001C14 17.8964 13.1046 17.001 12 17.001C10.8954 17.001 10 17.8964 10 19.001C10 20.1055 10.8954 21.001 12 21.001C13.1046 21.001 14 20.1055 14 19.001Z"
      fill="currentColor"
    />
  </svg>
);

export default Vertical3DotMenu;
