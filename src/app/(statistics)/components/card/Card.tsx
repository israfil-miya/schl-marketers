'use client';

import React from 'react';
import Image from 'next/image';
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
      className="bg-white border shadow-md rounded-lg overflow-hidden flex cursor-pointer"
      onClick={onClick}
    >
      <Image
        width={100}
        height={100}
        src={imageUrl}
        alt={title}
      />

      <div className="p-4">
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <p className="text-gray-700">{description}</p>
      </div>
    </div>
  );
};

export default Card;
