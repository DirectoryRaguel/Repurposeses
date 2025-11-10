import React, { useState, useEffect, useRef } from 'react';

interface EditableFieldProps {
    value: string;
    onUpdate: (newValue: string) => void;
    className?: string;
    inputClassName?: string;
}

const EditableField: React.FC<EditableFieldProps> = ({ value, onUpdate, className, inputClassName }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setText(value);
    }, [value]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);
    
    const handleUpdate = () => {
        if (text.trim()) {
            onUpdate(text.trim());
        } else {
            setText(value); // Revert if empty
        }
        setIsEditing(false);
    }

    if (isEditing) {
        return (
            <input
                ref={inputRef}
                type="text"
                value={text}
                onChange={e => setText(e.target.value)}
                onBlur={handleUpdate}
                onKeyDown={e => {
                    if (e.key === 'Enter') handleUpdate();
                    if (e.key === 'Escape') {
                        setText(value);
                        setIsEditing(false);
                    }
                }}
                className={inputClassName || "bg-indigo-50 rounded -m-1 p-1 outline-none focus:ring-2 ring-indigo-400"}
                onClick={(e) => e.stopPropagation()} // Prevent parent onClick
            />
        )
    }

    return (
        <span className={className || "cursor-pointer hover:bg-gray-100 rounded -m-1 p-1"} onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}>
            {value}
        </span>
    )
}

export default EditableField;
