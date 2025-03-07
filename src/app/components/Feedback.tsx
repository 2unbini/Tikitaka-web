import { feedbackService } from "@/services/feedbackService";
import { motion } from "framer-motion";
import { useState } from "react";

interface FeedbackProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  petId: string;
  onSubmit?: () => void;
}

export default function Feedback({
  isOpen,
  onClose,
  sessionId,
  petId,
  onSubmit,
}: FeedbackProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("별점을 선택해주세요!");
      return;
    }

    setIsSubmitting(true);
    try {
      await feedbackService.createFeedback({
        session_id: sessionId,
        pet_id: petId,
        rating,
        comment: comment.trim() || undefined,
      });

      if (onSubmit) {
        onSubmit();
      }
      onClose();
    } catch {
      alert("피드백 저장에 실패했어요.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <div className="p-6 space-y-6">
          <h3 className="text-center font-medium text-lg">서비스 피드백</h3>

          <div className="space-y-2">
            <label className="text-sm text-gray-600">
              티키타카는 어떠셨나요?
            </label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="text-2xl transition-colors"
                >
                  {star <= rating ? "★" : "☆"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-600">
              더 나은 서비스를 위한 의견을 들려주세요
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="의견을 자유롭게 적어주세요"
              className="w-full h-24 p-3 border rounded-lg text-sm resize-none"
            />
          </div>
        </div>

        <div className="border-t flex">
          <button
            onClick={onClose}
            className="flex-1 p-4 text-gray-500 font-medium text-sm hover:bg-gray-50 transition-colors rounded-bl-xl"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 p-4 text-blue-500 font-medium text-sm hover:bg-gray-50 transition-colors rounded-br-xl disabled:text-gray-400"
          >
            {isSubmitting ? "저장 중..." : "완료"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
