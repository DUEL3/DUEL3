import { useState } from "react";
import Image from "next/image";
import { units } from "src/constants/units";

const EditUnitComponent = ({
  index,
  unitId,
  isSub,
  setDraggedIndex,
  setDroppedIndex,
  handleDoubleClick,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleDrop = (e) => {
    console.log("handleDrop", index);
    e.preventDefault();
    setDroppedIndex({ index, isSub });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragStart = () => {
    console.log("handleDragStart", index);
    setDraggedIndex({ index, isSub });
    setShowTooltip(false);
  };

  const handleMouseEnter = () => {
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <>
      {showTooltip && (
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="absolute top-24 left-8 z-10"
          style={{
            width: "300px",
            height: "120px",
            backgroundImage: `url('/images/battle/tooltip.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="py-2 px-3 text-lg">
            <p className="">{units[unitId].name}</p>
            <p className="">
              {units[unitId].attack}/{units[unitId].life}
            </p>
            <p className="leading-tight">{units[unitId].description}</p>
          </div>
        </div>
      )}
      <div className="p-2 relative">
        {!unitId ? (
          <>
            <div
              onDrop={!isSub ? handleDrop : undefined}
              onDragOver={!isSub ? handleDragOver : undefined}
              style={{
                width: "160px",
                height: "204px",
              }}
            >
              <Image
                src={`/images/cards/empty.png`}
                alt=""
                width={160}
                height={204}
              />
            </div>
          </>
        ) : (
          <>
            <div
              draggable
              onDragStart={handleDragStart}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onDoubleClick={() => {
                setShowTooltip(false);
                handleDoubleClick();
              }}
              style={{
                width: "160px",
                height: "204px",
              }}
              className={
                isSub && index === 0
                  ? "tutorial-move-sub-unit"
                  : !isSub && index === 1
                    ? "tutorial-start"
                    : !isSub && index === 3
                      ? "tutorial-reverse-unit"
                      : ""
              }
            >
              <Image
                src={`/images/cards/${units[unitId].imagePath}.png`}
                alt=""
                width={160}
                height={204}
              />
            </div>
            <div className="flex justify-between">
              <div className="w-8 relative" style={{ top: "2px", left: "4px" }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image
                    src={`/images/common/numbers/${units[unitId].attack}.png`}
                    alt=""
                    width={160}
                    height={204}
                  />
                </div>
              </div>
              <div
                className="w-8 relative"
                style={{ top: "2px", right: "3px" }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image
                    src={`/images/common/numbers/${units[unitId].life}.png`}
                    alt=""
                    width={160}
                    height={204}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default EditUnitComponent;
