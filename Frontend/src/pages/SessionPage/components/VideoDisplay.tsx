import { Card } from "@/components/ui/card";

type Props = {
  isTeacher: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  sharedFile: any;
};

export const VideoDisplay = ({ isTeacher, videoRef, sharedFile }: Props) => {
  return (
    <div className="flex-1 p-6">
      <Card className="h-full flex flex-col p-4 gap-4 bg-card">
        <div className="flex-1 w-full h-full bg-black rounded overflow-hidden relative">
          
          {!isTeacher && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
          )}

          {isTeacher && sharedFile && (
            <div className="absolute inset-0 bg-white">
              <iframe
                src={sharedFile.url}
                className="w-full h-full"
                title="slides"
              />
            </div>
          )}

          {isTeacher && !sharedFile && (
            <div className="w-full h-full flex items-center justify-center text-white text-center p-4">
              <p>
                Sharing your screen...
                <br />
                Upload a PDF to view slides here.
              </p>
            </div>
          )}

          {!isTeacher && !sharedFile && (
            <div className="absolute inset-0 flex items-center justify-center text-white/50 text-sm">
              No content shared yet
            </div>
          )}

        </div>
      </Card>
    </div>
  );
};