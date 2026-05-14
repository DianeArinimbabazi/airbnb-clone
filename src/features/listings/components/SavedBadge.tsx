interface Props {
  count: number;
}

export default function SavedBadge({ count }: Props) {
  if (count === 0) return null;
  return (
    <div className="saved-badge">
      {count} saved{count === 1 ? '' : 's'}
    </div>
  );
}