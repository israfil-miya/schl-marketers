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
    <div className="bg-white shadow-md overflow-hidden flex cursor-pointer w-auto border">
      <div className="w-1/3">
        <Image
          src={imageUrl}
          alt={title}
          width={50} // Set a suitable width
          height={50} // Set a suitable height
          className="w-full h-full object-cover"
        />
      </div>
      <div className="w-2/3 p-4">
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <p className="text-gray-700">{description}</p>
      </div>
    </div>
  );
};

export default Card;
