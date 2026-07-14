import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

/** Brand mark styled like FaTelegram / FaInstagram */
export const NovaPoshtaIcon = ({
  size = 24,
  className,
  ...props
}: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="4 4 40 40"
    fill="none"
    aria-hidden
    className={className}
    {...props}
  >
    <path
      stroke="currentColor"
      strokeWidth="3.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m5.5 24l7.488-7.488v14.976zm37 0l-7.488-7.488v14.976zm-22.024 3.524h7.048v7.488h3.964L24 42.5l-7.488-7.488h3.964zm0-7.048h7.048v-7.488h3.964L24 5.5l-7.488 7.488h3.964z"
    />
  </svg>
);

export const UkrposhtaIcon = ({
  size = 22,
  className,
  ...props
}: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    aria-hidden
    className={className}
    {...props}
  >
    <path
      stroke="currentColor"
      strokeWidth="3.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M25.304 24.44c10.34-2.145 7.439-14.554-.177-14.554c-7.854 0-10.674 11.23-1.822 14.083l13.23 3.11L24.95 43.5s-9.611-13.065-12.436-17.67C6.804 16.52 13.748 4.545 24.961 4.5c12.567 0 17.54 14 8.383 21.83"
    />
  </svg>
);
