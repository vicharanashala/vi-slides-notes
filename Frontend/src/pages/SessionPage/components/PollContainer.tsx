import { StudentPollPopup } from "@/components/StudentPollPopup";
import { PollStatistics } from "@/components/PollStatistics";
import { PastPollsModal } from "@/components/PastPollsModal";

type Props = {
  isTeacher: boolean;
  currentPoll: any;
  hasVoted: boolean;
  showPollStats: boolean;
  pollStats: any;
  showPastPolls: boolean;
  pastPolls: any[];
  onSubmitPoll: (option: number) => void;
  onCloseStats: () => void;
  onClosePastPolls: () => void;
};

export const PollContainer = ({
  isTeacher,
  currentPoll,
  hasVoted,
  showPollStats,
  pollStats,
  showPastPolls,
  pastPolls,
  onSubmitPoll,
  onCloseStats,
  onClosePastPolls,
}: Props) => {
  return (
    <>
      {/* Student Poll Popup */}
      {!isTeacher && currentPoll && !hasVoted && (
        <StudentPollPopup poll={currentPoll} onSubmit={onSubmitPoll} />
      )}

      {/* Poll Statistics */}
      {showPollStats && pollStats && (
        <div className="fixed bottom-6 right-6 z-40">
          <PollStatistics
            open={showPollStats}
            question={pollStats.question || "Poll Results"}
            statistics={pollStats.statistics || []}
            onClose={onCloseStats}
          />
        </div>
      )}

      {/* Past Polls */}
      <PastPollsModal
        open={showPastPolls}
        onClose={onClosePastPolls}
        polls={pastPolls}
      />
    </>
  );
};