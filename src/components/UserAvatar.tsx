import React from 'react';
import { 
  GraduationCap, 
  Flower2, 
  Rocket, 
  Coffee, 
  Sparkles, 
  Terminal, 
  BookOpen, 
  Target, 
  User 
} from 'lucide-react';
import { AVATAR_OPTIONS, getAvatarOption } from '../utils/avatars';

interface UserAvatarProps {
  avatarId?: string;
  photoURL?: string | null;
  name?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatarId,
  photoURL,
  name,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs rounded-lg',
    md: 'w-9 h-9 text-sm rounded-xl',
    lg: 'w-12 h-12 text-base rounded-2xl',
    xl: 'w-16 h-16 text-xl rounded-2xl',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4.5 h-4.5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  if (photoURL) {
    return (
      <img
        src={photoURL}
        alt={name || 'Avatar'}
        referrerPolicy="no-referrer"
        className={`${sizeClasses[size]} object-cover shadow-2xs ${className}`}
      />
    );
  }

  const option = getAvatarOption(avatarId);
  const iconClass = iconSizes[size];

  const renderIcon = () => {
    switch (option.iconName) {
      case 'Flower2':
        return <Flower2 className={iconClass} />;
      case 'Rocket':
        return <Rocket className={iconClass} />;
      case 'Coffee':
        return <Coffee className={iconClass} />;
      case 'Sparkles':
        return <Sparkles className={iconClass} />;
      case 'Terminal':
        return <Terminal className={iconClass} />;
      case 'BookOpen':
        return <BookOpen className={iconClass} />;
      case 'Target':
        return <Target className={iconClass} />;
      case 'GraduationCap':
      default:
        return <GraduationCap className={iconClass} />;
    }
  };

  return (
    <div
      className={`${sizeClasses[size]} ${option.bgColor} ${option.textColor} flex items-center justify-center font-bold shadow-2xs shrink-0 select-none ${className}`}
    >
      {renderIcon()}
    </div>
  );
};
