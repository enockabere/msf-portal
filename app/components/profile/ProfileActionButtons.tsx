import { Save, User, ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";

interface ProfileActionButtonsProps {
  isEditing: boolean;
  isSubmitting: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onQuit: () => void;
  onContinue?: () => void;
  showContinueButton?: boolean;
}

export const ProfileActionButtons = ({
  isEditing,
  isSubmitting,
  onEdit,
  onCancel,
  onSubmit,
  onQuit,
  onContinue,
  showContinueButton = false,
}: ProfileActionButtonsProps) => {
  const [loadingContinue, setLoadingContinue] = useState(false);

  const handleContinue = async () => {
    setLoadingContinue(true);
    try {
      if (onContinue) onContinue();
    } catch (err) {
      console.error("Error continuing to dashboard:", err);
    } finally {
      setTimeout(() => setLoadingContinue(false), 2000); 
    }
  };

  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex gap-2">
        <button
          onClick={onQuit}
          className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm transition-colors"
        >
          <ArrowLeft size={14} /> Back to Home
        </button>

        {showContinueButton && !isEditing && (
          <button
            onClick={handleContinue}
            disabled={loadingContinue}
            className={`flex items-center justify-center border border-red-500 text-red-600 hover:bg-red-600 hover:text-white p-1.5 rounded-lg text-sm transition-colors ${
              loadingContinue ? "opacity-50 cursor-wait" : ""
            }`}
            title="Continue to Dashboard"
          >
            {loadingContinue ? (
              <svg
                className="animate-spin h-4 w-4 text-red-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            ) : (
              <ArrowRight size={14} />
            )}
          </button>
        )}
      </div>

      <div className="flex gap-2">
        {!isEditing ? (
          <button
            onClick={onEdit}
            className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
          >
            <User size={14} /> Edit Profile
          </button>
        ) : (
          <>
            <button
              onClick={onCancel}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1.5 rounded-lg text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={isSubmitting}
              className={`flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              <Save size={14} /> {isSubmitting ? "Saving..." : "Save"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
