import React from "react";

export const ProgressCircle = (props: {
  size: number;
  strokeWidth: number;
  progress: number;
  className?: string;
}) => {
  const radius = props.size / 2 - props.strokeWidth * 2;
  const circumference = 2 * Math.PI * radius;
  return (
    <svg className={props.className} width={props.size} height={props.size}>
      <circle
        className={`fill-transparent stroke-white origin-center`}
        strokeWidth={props.strokeWidth}
        r={radius}
        cx={props.size / 2}
        cy={props.size / 2}
      />
      <circle
        className={`fill-transparent stroke-blue-400 origin-center [transform:rotate(-90deg)]`}
        strokeWidth={props.strokeWidth}
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={circumference - props.progress * circumference}
        r={radius}
        cx={props.size / 2}
        cy={props.size / 2}
      />
    </svg>
  );
};
