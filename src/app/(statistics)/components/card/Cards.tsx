'use client';

import React from 'react';

import Card from './Card';

const Cards = () => {
  return (
    <div className="inline-flex">
      <Card
        title="Trial Clients"
        imageUrl="https://images.unsplash.com/photo-1675497219360-270db3f96e06?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        description="View test orders trend"
        onClick={() => console.log('Test Orders')}
      />
    </div>
  );
};

export default Cards;
