import { SVGProps, ReactElement } from 'react';

function SampleIcon(props: SVGProps<SVGSVGElement>): ReactElement {
  return (
    <svg
      width={16}
      height={5}
      viewBox="0 0 16 5"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M10.704 4.832L16 2.52 10.704.208v1.62h-5.5L3.432.168H0l1.14 1.66v1.344h.006L.033 4.832h3.432l1.746-1.66h5.493v1.66z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SampleIcon;
