
import React from 'react';
// import { PlacementUpdate } from './placementDetailTypes'; // This import is removed as the file is deleted
import UpdateCardItem from './UpdateCardItem.jsx'; // Adjusted import

// No local User type definition needed if role is accessed directly

const PlacementUpdatesSection = ({
  updates,
  user,
  onEditUpdate,
  onDeleteUpdate,
}) => {
  if (!updates || updates.length === 0) {
    return null; 
  }

  return (
    <div className="md:col-span-3 space-y-3 pt-4 border-t mt-2">
      <h3 className="text-lg font-semibold text-slate-700">Updates:</h3>
      {updates.slice().reverse().map(update => (
        <UpdateCardItem
          key={update._id}
          update={update}
          user={user}
          onEdit={onEditUpdate}
          onDelete={onDeleteUpdate}
        />
      ))}
    </div>
  );
};

export default PlacementUpdatesSection;

