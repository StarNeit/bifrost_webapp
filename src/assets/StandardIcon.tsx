import { SVGProps, ReactElement } from 'react';

function StandardIcon(props: SVGProps<SVGSVGElement>): ReactElement {
  return (
    <svg
      width={16}
      height={17}
      viewBox="0 0 16 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M10.454 8.5A2.448 2.448 0 018 10.941 2.448 2.448 0 015.546 8.5 2.448 2.448 0 018 6.059 2.448 2.448 0 0110.454 8.5z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.227 8.5c0 2.89-2.347 5.22-5.227 5.22A5.224 5.224 0 012.773 8.5C2.773 5.61 5.12 3.28 8 3.28c2.88 0 5.227 2.33 5.227 5.22zM8 12.218A3.723 3.723 0 0011.728 8.5 3.723 3.723 0 008 4.782 3.723 3.723 0 004.272 8.5 3.723 3.723 0 008 12.218z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 16.5a8 8 0 100-16 8 8 0 000 16zm6.501-8A6.5 6.5 0 018 14.998 6.5 6.5 0 011.499 8.5 6.5 6.5 0 018 2.002 6.5 6.5 0 0114.501 8.5z"
        fill="currentColor"
      />
    </svg>
  );
}

export default StandardIcon;
