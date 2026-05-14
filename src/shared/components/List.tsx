import React from "react";
import { Spinner } from "./Spinner";

interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string | number;
  emptyMessage?: string;
  loading?: boolean;
  className?: string;
}

export function List<T>({
  items, renderItem, keyExtractor,
  emptyMessage = "No items found.",
  loading = false, className,
}: ListProps<T>): React.ReactElement {
  if (loading) return <Spinner />;
  if (items.length === 0) return <p style={{ textAlign: "center", color: "#888", padding: "40px" }}>{emptyMessage}</p>;
  return (
    <div className={className}>
      {items.map((item, index) => (
        <React.Fragment key={keyExtractor(item)}>{renderItem(item, index)}</React.Fragment>
      ))}
    </div>
  );
}
