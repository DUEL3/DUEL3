import Image from "next/image";
import React, { useState, useEffect } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";
import { TUTORIAL } from "src/constants/interface";

export default function Tutorial({ tutorial, clearCallback }) {
  const [run, setRun] = useState(true);
  const [imagePath, setImagePath] = useState("/images/edit/Tutorial_arrow.png");
  const [imageWidth, setImageWidth] = useState(160);
  const [imagePosition, setImagePosition] = useState({ left: 0, top: 0 });

  useEffect(() => {
    if (tutorial === TUTORIAL.MoveSubUnit) {
      setImagePath("/images/edit/Tutorial_arrow.png");
      const updateImagePosition = () => {
        const element1 = document.querySelector(".tutorial-move-sub-unit");
        const element2 = document.querySelector(".tutorial-move-sub-unit2");
        if (element1 && element2) {
          const rect1 = element1.getBoundingClientRect();
          const rect2 = element2.getBoundingClientRect();
          const width = Math.abs(rect2.left - rect1.left);
          const left =
            (rect1.left + rect1.width / 2 + rect2.left + rect2.width / 2) / 2;
          const top =
            (rect1.top + rect1.height / 2 + rect2.top + rect2.height / 2) / 2;
          setImageWidth(width);
          setImagePosition({ left, top });
        }
      };

      updateImagePosition();
      window.addEventListener("resize", updateImagePosition);
      return () => {
        window.removeEventListener("resize", updateImagePosition);
      };
    } else if (tutorial === TUTORIAL.ReverseUnit) {
      setImagePath("/images/edit/Tutorial_arrow_reverse.png");
      const updateImagePosition = () => {
        const element1 = document.querySelector(".tutorial-reverse-unit");
        const element2 = document.querySelector(".tutorial-reverse-unit2");
        if (element1 && element2) {
          const rect1 = element1.getBoundingClientRect();
          const rect2 = element2.getBoundingClientRect();
          const width = Math.abs(rect2.left - rect1.left);
          const left =
            (rect1.left + rect1.width / 2 + rect2.left + rect2.width / 2) / 2;
          const top =
            (rect1.top + rect1.height / 2 + rect2.top + rect2.height / 2) / 2;
          setImageWidth(width);
          setImagePosition({ left, top });
        }
      };

      updateImagePosition();
      window.addEventListener("resize", updateImagePosition);
      return () => {
        window.removeEventListener("resize", updateImagePosition);
      };
    }
  }, [tutorial]);

  useEffect(() => {}, []);

  let text, target;
  if (tutorial === TUTORIAL.Start) {
    text = "Press START button and send initial transaction!!";
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
      <Image
        src={imagePath}
        alt=""
        width={imageWidth}
        height={204}
        style={{
          position: "fixed",
          zIndex: 10001,
          left: imagePosition.left,
          top: imagePosition.top,
          transform: "translate(-50%, -50%)", // Center the image
        }}
      />
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
