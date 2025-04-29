import { CheckCircle, Lock, Circle } from "lucide-react";
import classNames from "classnames";

const steps = [
  { title: "Card Details", status: "completed" },
  { title: "Form Review", status: "completed" },
  { title: "Authenticate OTP", status: "inProgress" },
  { title: "Create Code", status: "pending" },
];

export default function Stepper() {
  return (
    <div className="bg-white shadow rounded-lg px-6 py-4 flex justify-between items-center">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const isCompleted = step.status === "completed";
        const isInProgress = step.status === "inProgress";
        const isPending = step.status === "pending";

        return (
          <div key={index} className="flex items-center w-full relative">
            <div className="flex flex-col items-center text-center w-full">
              <div
                className={classNames(
                  "w-10 h-10 flex items-center justify-center rounded-full border-2 mb-2",
                  {
                    "bg-green-500 text-white border-green-500": isCompleted,
                    "border-blue-500 text-blue-500": isInProgress,
                    "border-gray-300 text-gray-400": isPending,
                  }
                )}
              >
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : isInProgress ? (
                  <Lock className="w-5 h-5" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </div>
              <div className="text-xs text-gray-500 uppercase">
                STEP {index + 1}
              </div>
              <div className="text-sm font-medium">{step.title}</div>
              <div
                className={classNames("text-xs mt-1", {
                  "text-green-500": isCompleted,
                  "text-blue-500": isInProgress,
                  "text-gray-400": isPending,
                })}
              >
                {isCompleted
                  ? "Completed"
                  : isInProgress
                  ? "In Progress"
                  : "Pending"}
              </div>
            </div>

            {!isLast && (
              <div
                className={classNames(
                  "absolute top-5 left-1/2 transform translate-x-1/2 h-1 w-full z-0",
                  {
                    "bg-green-500": isCompleted,
                    "bg-blue-500": isInProgress,
                    "bg-gray-300": isPending,
                  }
                )}
              ></div>
            )}
          </div>
        );
      })}
    </div>
  );
}
