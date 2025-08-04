function Logo({ size = 40, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Replace this with your custom paths or design */}
      <circle cx="50" cy="50" r="48" stroke="#3B82F6" strokeWidth="4" fill="white" />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        fill="#3B82F6"
        dy=".3em"
        fontSize="28"
        fontWeight="bold"
        fontFamily="sans-serif"
      >
        F
      </text>
    </svg>
  );
}

export default Logo;
