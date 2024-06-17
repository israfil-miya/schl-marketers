'use client';

import React from 'react';

interface CardProps {
  title: string;
  imageUrl: string;
  description: string;
  onClick: () => void;
}

const Card: React.FC<CardProps> = ({
  title,
  imageUrl,
  description,
  onClick,
}) => {
  return (
    <div
      className="bg-white shadow-md rounded-lg overflow-hidden flex cursor-pointer"
      onClick={onClick}
    >
      <div className="w-1/3">
        <img src={imageUrl} alt={title} className="w-full h-auto" />
      </div>
      <div className="w-2/3 p-4">
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <p className="text-gray-700">{description}</p>
      </div>
    </div>
  );
};

export default Card;
