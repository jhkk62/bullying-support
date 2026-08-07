// src/components/AvatarUpload.jsx
import { useRef, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function AvatarUpload({ user, onUploadComplete, currentUrl }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result;
        await updateDoc(doc(db, "alunos", user.uid), { fotoUrl: base64 });
        onUploadComplete(base64);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  }

  const inicial = currentUrl ? "✓" : "📷";

  return (
    <div className="relative">
      <div
        onClick={() => inputRef.current?.click()}
        className="w-32 h-32 rounded-full bg-white flex items-center justify-center text-5xl font-bold border-4 border-white shadow-lg cursor-pointer hover:opacity-90 transition-opacity overflow-hidden"
      >
        {currentUrl ? (
          <img src={currentUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl">📷</span>
        )}
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="absolute bottom-0 right-0 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-lg"
        title="Mudar foto"
      >
        ✏️
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
        disabled={uploading}
      />
    </div>
  );
}