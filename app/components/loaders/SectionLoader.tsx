import { Loader } from "lucide-react";
import React from "react";

export default function SectionLoader({ size = 16, classes }: { size?: number, classes?: string }) {
    return (
        <Loader size={size} className={`animate-spin ${classes}`} />
    )
}