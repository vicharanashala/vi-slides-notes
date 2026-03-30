import Whiteboard from "@/components/Whiteboard";

type Props = {
  show: boolean;
  onClose: () => void;
};

export const WhiteboardModal = ({ show, onClose }: Props) => {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-[90%] h-[90%] bg-white rounded-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Whiteboard onClose={onClose} />
      </div>
    </div>
  );
};