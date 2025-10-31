
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner, Html5QrcodeError, Html5QrcodeResult } from 'html5-qrcode';
import { usePlaces } from '../hooks/usePlaces';
import { TOURIST_PLACES } from '../constants';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

// 🧩 Este componente tiene una única responsabilidad (SRP): escanear y validar códigos QR.
//    Maneja la lógica de la cámara, la decodificación del QR y la comunicación con el
//    contexto de la aplicación para desbloquear lugares.

const ScannerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { unlockPlace } = usePlaces();
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null);

  const place = TOURIST_PLACES.find(p => p.id === id);

  useEffect(() => {
    if (!place) {
      navigate('/');
      return;
    }

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );
    scannerRef.current = scanner;

    const onScanSuccess = (decodedText: string, decodedResult: Html5QrcodeResult) => {
      scanner.clear();
      if (decodedText === place.qrCodeValue) {
        setScanResult('success');
        unlockPlace(place.id);
        setTimeout(() => navigate(`/gallery/${place.id}`), 1500);
      } else {
        setScanResult('error');
        setTimeout(() => setScanResult(null), 2000); // Reset after 2s
      }
    };
    
    const onScanError = (errorMessage: string, error: Html5QrcodeError) => {
      // Ignorar errores comunes que no son fallos de escaneo
    };

    scanner.render(onScanSuccess, onScanError);
    
    // ⚙️ La función de limpieza en 'useEffect' es crucial.
    //    Se asegura de que, al desmontar el componente, se liberen los recursos
    //    como la cámara, evitando fugas de memoria y comportamientos inesperados.
    return () => {
      scanner.clear().catch(error => {
        console.error("Failed to clear html5-qrcode-scanner.", error);
      });
    };
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate, place, unlockPlace]);

  if (!place) return null;

  return (
    <div className="absolute inset-0 bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <button onClick={() => navigate('/')} className="absolute top-4 left-4 z-20 p-2 bg-white/20 rounded-full">
        <ArrowLeft />
      </button>
      <h1 className="text-2xl font-bold mb-2">Escanear QR</h1>
      <p className="text-lg mb-4 text-center">Apunta la cámara al código QR de <span className="font-semibold text-sun-dark">{place.name}</span></p>

      <div id="qr-reader" className="w-full max-w-sm rounded-lg overflow-hidden relative">
        {scanResult && (
          <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center transition-opacity duration-300 ${scanResult === 'success' ? 'bg-nature/90' : 'bg-red-600/90'}`}>
            {scanResult === 'success' ? (
              <>
                <CheckCircle size={64} className="animate-pulse" />
                <p className="mt-4 text-xl font-semibold">¡Lugar Desbloqueado!</p>
              </>
            ) : (
              <>
                <XCircle size={64} />
                <p className="mt-4 text-xl font-semibold">Código QR Inválido</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScannerPage;
