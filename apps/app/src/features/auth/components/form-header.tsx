import type React from 'react';

interface FormHeaderProps {
  heading: string;
  description: string;
}

export const FormHeader: React.FC<FormHeaderProps> = ({ heading, description }) => {
  return (
    <div className="space-y-1.5">
      <h3 className="text-xl font-semibold text-gray-900">{heading}</h3>
      <p className="text-sm text-gray-500 font-medium">{description}</p>
    </div>
  );
};
