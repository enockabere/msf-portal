import { Camera, MapPin } from "lucide-react";
import Image from "next/image";

interface ProfileHeaderProps {
  avatar: string;
  firstName: string;
  middleName: string;
  lastName: string;
  title: string;
  city: string;
  isEditing: boolean;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProfileHeader = ({
  avatar,
  firstName,
  middleName,
  lastName,
  title,
  city,
  isEditing,
  onAvatarChange,
}: ProfileHeaderProps) => (
  <div className="bg-gradient-to-r from-red-600 to-red-800 p-6 text-white">
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative group">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white/20 overflow-hidden shadow-lg">
          <Image
            src={avatar}
            alt="Profile"
            width={96}
            height={96}
            className="w-full h-full object-cover"
          />
        </div>
        {isEditing && (
          <label className="absolute bottom-0 right-0 bg-red-500 rounded-full p-2 cursor-pointer group-hover:bg-red-600 transition-all shadow-md">
            <Camera size={16} />
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={onAvatarChange}
            />
          </label>
        )}
      </div>

      <div className="flex-1 text-center sm:text-left">
        <h1 className="text-xl sm:text-2xl font-bold">
          {firstName} {middleName} {lastName}
        </h1>
        <p className="text-red-100 mt-1">{title}</p>
        <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
          <span className="flex items-center text-xs bg-white/10 px-2 py-0.5 rounded-full">
            <MapPin size={12} className="mr-1" /> {city}
          </span>
        </div>
      </div>
    </div>
  </div>
);
