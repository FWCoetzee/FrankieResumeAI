
"use client";

import { AiEditToolbar } from "./ai-edit-toolbar";
import { cn } from "@/lib/utils";

interface EditableFieldProps<T extends React.ElementType> {
  as?: T;
  value: string;
  onAccept: (fieldPath: string, newValue: string) => void;
  fieldPath: string;
  targetJob?: string;
  isListItem?: boolean;
  className?: string;
}

export function EditableField<T extends React.ElementType = "div">({
  as,
  value,
  onAccept,
  fieldPath,
  targetJob,
  isListItem = false,
  className,
  ...props
}: EditableFieldProps<T> & Omit<React.ComponentPropsWithoutRef<T>, keyof EditableFieldProps<T>>) {
  
  const Component = as || "div";
  
  const handleAccept = (newValue: string) => {
    onAccept(fieldPath, newValue);
  };

  const containerClasses = cn(
    "relative group/editable",
    isListItem ? "" : "hover:bg-primary/5 p-1 -m-1 rounded-md transition-colors"
  );
  
  const contentClasses = cn(className, isListItem ? 'inline' : 'block');

  if (isListItem) {
    return (
        <span className={containerClasses}>
             <Component className={contentClasses} {...props}>
                {value}
            </Component>
            <AiEditToolbar originalContent={value} onAccept={handleAccept} targetJob={targetJob} />
        </span>
    );
  }

  return (
    <div className={containerClasses}>
      <Component className={contentClasses} {...props}>
        {value}
      </Component>
      <AiEditToolbar originalContent={value} onAccept={handleAccept} targetJob={targetJob} />
    </div>
  );
}
