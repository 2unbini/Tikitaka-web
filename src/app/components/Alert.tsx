import { motion } from "framer-motion";

interface AlertProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Alert({ isOpen, onClose }: AlertProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/25 flex items-center justify-center z-50 px-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl max-w-xs w-full shadow-2xl"
      >
        <div className="p-6 space-y-4">
          <h3 className="text-center font-medium text-lg">메시지 제한 안내</h3>
          <p className="text-center text-gray-600 text-sm leading-relaxed">
            10개의 메시지가 모두 소진되었습니다. 빠른 시일 내에 신규 서비스로
            찾아뵙겠습니다! 🙏
          </p>
        </div>
        <div className="border-t">
          <button
            onClick={onClose}
            className="w-full p-4 text-blue-500 font-medium text-sm hover:bg-gray-50 transition-colors rounded-b-xl"
          >
            확인
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
