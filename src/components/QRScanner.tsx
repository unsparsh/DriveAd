import { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import Webcam from 'react-webcam';
import { Camera, X } from 'lucide-react';

interface QRScannerProps {
  onScan: (data: string, imageData?: string) => void;
  onClose: () => void;
}

const QRScanner = ({ onScan, onClose }: QRScannerProps) => {
  const [scanning, setScanning] = useState(false);
  const [cameraMode, setCameraMode] = useState<'qr' | 'photo'>('qr');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerDivRef = useRef<HTMLDivElement>(null);
  const webcamRef = useRef<Webcam>(null);

  // Initialize scanner
  useEffect(() => {
    if (scannerDivRef.current && cameraMode === 'qr') {
      scannerRef.current = new Html5Qrcode('qr-reader');
      
      // Get available cameras
      Html5Qrcode.getCameras()
        .then(devices => {
          if (devices && devices.length) {
            setDevices(devices);
            setSelectedDeviceId(devices[0].id);
          }
        })
        .catch(err => {
          console.error('Error getting cameras', err);
        });
    }
    
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop()
          .catch(err => console.error('Error stopping scanner', err));
      }
    };
  }, [cameraMode]);

  // Start/stop scanning based on scanning state
  useEffect(() => {
    if (!scannerRef.current || cameraMode !== 'qr') return;
    
    if (scanning && selectedDeviceId) {
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1
      };
      
      scannerRef.current.start(
        selectedDeviceId,
        config,
        (decodedText) => {
          onScan(decodedText);
          setScanning(false);
        },
        (errorMessage) => {
          // QR code scanning error - this is normal when no QR code is in view
          console.log(errorMessage);
        }
      ).catch(err => {
        console.error('Error starting scanner', err);
        setScanning(false);
      });
    } else if (!scanning && scannerRef.current.isScanning) {
      scannerRef.current.stop()
        .catch(err => console.error('Error stopping scanner', err));
    }
  }, [scanning, selectedDeviceId, cameraMode, onScan]);

  const toggleScanning = () => {
    setScanning(!scanning);
  };

  const toggleCamera = () => {
    setFacingMode(facingMode === 'user' ? 'environment' : 'user');
  };

  const capturePhoto = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        onScan('photo_verification', imageSrc);
      }
    }
  };

  const videoConstraints = {
    facingMode,
    width: { ideal: 1280 },
    height: { ideal: 720 }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
        <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
          <h3 className="text-lg font-medium">
            {cameraMode === 'qr' ? 'Scan QR Code' : 'Take Verification Photo'}
          </h3>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-4">
          <div className="flex justify-center mb-4">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                  cameraMode === 'qr' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => setCameraMode('qr')}
              >
                QR Scanner
              </button>
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                  cameraMode === 'photo' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => setCameraMode('photo')}
              >
                Take Photo
              </button>
            </div>
          </div>
          
          {cameraMode === 'qr' ? (
            <>
              <div 
                id="qr-reader" 
                ref={scannerDivRef}
                className="w-full aspect-square max-w-sm mx-auto overflow-hidden rounded-lg"
              ></div>
              
              {devices.length > 1 && (
                <div className="mt-4">
                  <label htmlFor="camera-select" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Camera
                  </label>
                  <select
                    id="camera-select"
                    value={selectedDeviceId}
                    onChange={(e) => setSelectedDeviceId(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    disabled={scanning}
                  >
                    {devices.map(device => (
                      <option key={device.id} value={device.id}>
                        {device.label || `Camera ${device.id}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="mt-4 flex justify-center">
                <button
                  onClick={toggleScanning}
                  className={`px-4 py-2 rounded-md text-white font-medium ${
                    scanning ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {scanning ? 'Stop Scanning' : 'Start Scanning'}
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-full aspect-square max-w-sm mx-auto overflow-hidden rounded-lg bg-gray-100 relative">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="mt-4 flex space-x-4">
                <button
                  onClick={toggleCamera}
                  className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Flip Camera
                </button>
                <button
                  onClick={capturePhoto}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
                >
                  <Camera size={18} className="mr-2" />
                  Capture Photo
                </button>
              </div>
              
              <p className="mt-4 text-sm text-gray-600 text-center">
                Take a clear photo of the banner placed on your vehicle for verification.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;