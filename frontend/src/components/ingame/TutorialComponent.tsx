import React, { useState } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";
import { TUTORIAL } from "src/constants/interface";

export default function Tutorial({ tutorial, clearCallback }) {
  const [run, setRun] = useState(true);

  let text, target;
  if (tutorial === TUTORIAL.Start) {
    text = "Attack is 3, Life is 4. Press START button to start!!";
    target = ".tutorial-start";
  } else if (tutorial === TUTORIAL.MoveSubUnit) {
    text = "Let's Move to STARTING members.";
    target = ".tutorial-move-sub-unit";
  } else if (tutorial === TUTORIAL.ReverseUnit) {
    text = "You can change the order to move on another card.";
    target = ".tutorial-reverse-unit";
  }

  const steps: Step[] = [
    {
      content: <></>,
      target: ".body",
    },
    {
      content: <h2>{text}</h2>,
      spotlightPadding: 20,
      target: target,
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      clearCallback();
      setRun(false);
    }
  };

  return (
    <div>
      <Joyride
        callback={handleJoyrideCallback}
        continuous
        run={run}
        // scrollToFirstStep
        // showProgress
        // showSkipButton
        steps={steps}
        styles={{
          options: {
            zIndex: 10000,
          },
          buttonNext: {
            backgroundColor: "#4CAF50",
            color: "#fff",
            borderRadius: "5px",
            padding: "10px 20px",
          },
          buttonBack: {
            color: "#000",
          },
        }}
      />
      {/* <section className="demo__hero">
        <div>
          <button
            onClick={(event: React.MouseEvent<HTMLElement>) => {
              event.preventDefault();
              setRun(true);
            }}
          >
            Start
          </button>
        </div>
      </section> */}
    </div>
  );
}
