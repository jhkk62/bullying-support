// src/pages/SiteOffline.jsx
import RoboManutencao from "../components/RoboManutencao";

export default function SiteOffline() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
      <RoboManutencao />
      <h1 className="text-2xl font-bold text-gray-800 mt-6 mb-2">Estamos fora do ar</h1>
      <p className="text-gray-500 max-w-sm">
        O Apoia+ está temporariamente desativado para manutenção. Volte mais tarde.
      </p>
    </div>
  );
}