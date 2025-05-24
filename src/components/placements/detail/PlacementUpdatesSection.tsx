import React from 'react';
import { PlacementUpdate } from './placementDetailTypes';
import UpdateCardItem from './UpdateCardItem';

// Local User type definition
interface User {
  role?: 'admin' | 'student' | 'faculty';
}

interface PlacementUpdatesSectionProps {
  updates: PlacementUpdate[];
  user: User | null;
  onEditUpdate: (update: PlacementUpdate) => void;
  onDeleteUpdate: (updateId: string) => void;
}

const PlacementUpdatesSection: React.FC<PlacementUpdatesSectionProps> = ({
  updates,
  user,
  onEditUpdate,
  onDeleteUpdate,
}) => {
  if (!updates || updates.length === 0) {
    // It's better to show a message if admin is viewing and can add updates.
    // For now, returning null if no updates.
    // If user is admin, maybe show "No updates yet. Add one?"
    // For now, to maintain original behavior as closely as possible:
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
