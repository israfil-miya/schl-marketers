'use client';

import React from 'react';

import Card from './Card';

const Cards = () => {
  return (
    <div className="inline-flex gap-3 my-4">
      <Card
        title="Trial Clients"
        imageUrl="https://images.unsplash.com/photo-1675497219360-270db3f96e06?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        description="Clients that placed test orders but haven't converted to regular customers."
        onClick={() => console.log('View Trial Clients')}
      />
      <Card
        title="Inactive Clients"
        imageUrl="https://images.unsplash.com/photo-1675497219360-270db3f96e06?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        description="Clients contacted over 2 months ago who haven't converted to regular customers."
        onClick={() => console.log('View Inactive Clients')}
      />
      <Card
        title="Potential Clients"
        imageUrl="https://images.unsplash.com/photo-1675497219360-270db3f96e06?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        description="Clients with high conversion potential."
        onClick={() => console.log('View Potential Clients')}
      />
      <Card
        title="Regular Clients"
        imageUrl="https://images.unsplash.com/photo-1675497219360-270db3f96e06?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        description="Clients that consistently place orders."
        onClick={() => console.log('View Regular Clients')}
      />
    </div>
  );
};

export default Cards;
