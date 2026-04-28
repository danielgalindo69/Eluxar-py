import React, { useState, useRef } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { userAPI } from '../../../core/api/api';
import { Edit2 } from 'lucide-react';

interface ProfileImageUploadProps {
    displayName?: string;
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({ displayName }) => {
    const { user, updateUser } = useAuth();
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const nameToDisplay = displayName || user?.name || 'Usuario';

    const optimizedImageUrl = user?.pictureUrl 
        ? `${user.pictureUrl}?tr=f-webp` 
        : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.name || 'User') + '&background=EDEDED&color=111111';

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            setError('2MB Máx.');
            return;
        }

        const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setError('Tipo inválido');
            return;
        }

        setIsUploading(true);
        setError(null);

        try {
            const result = await userAPI.uploadProfileImage(file);
            updateUser({ pictureUrl: result.imageUrl });
        } catch (err: any) {
            setError('Error al subir');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="flex flex-col items-center">
            {/* Profile Image Circle */}
            <div className="w-44 h-44 rounded-full overflow-hidden border border-[#EDEDED] dark:border-white/8 mb-6 shadow-sm">
                <img 
                    src={optimizedImageUrl} 
                    alt="Profile" 
                    className={`w-full h-full object-cover transition-all duration-700 ${isUploading ? 'blur-md opacity-30' : ''}`}
                />
            </div>

            {/* User Info from mockup */}
            <h2 className="text-2xl font-light text-[#111111] dark:text-white mb-2">{nameToDisplay}</h2>
            <div className="mb-8 font-bold text-[10px] tracking-[0.2em] uppercase bg-[#3A4A3F] text-white px-6 py-2 rounded-sm shadow-sm">
                {user?.role || 'CLIENTE'}
            </div>

            {/* Edit Image Button */}
            <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-3 py-3 px-8 border border-[#EDEDED] dark:border-white/8 bg-[#F7F7F7] hover:bg-white dark:bg-[#161616] text-[11px] uppercase tracking-[0.1em] font-medium text-[#111111]/70 hover:text-[#111111] dark:text-white transition-all rounded-md shadow-sm"
            >
                <Edit2 size={14} className="opacity-50" />
                {isUploading ? 'Subiendo...' : 'Editar imagen'}
            </button>

            <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
            />

            {error && (
                <p className="mt-4 text-[9px] uppercase tracking-widest font-bold text-red-500">
                    {error}
                </p>
            )}
        </div>
    );
};

export default ProfileImageUpload;
