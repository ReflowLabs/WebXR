import { Vector3 } from "@babylonjs/core";
import { Texture } from "react-babylonjs";

const Gui = ({ state }) => {
  const text = JSON.stringify(state, null, 2);
  return (
    <>
      <plane
        name="dialog"
        width={3}
        height={3}
        position={new Vector3(-2, 3, 0)}
      >
        <advancedDynamicTexture
          name="dialogTexture"
          height={1024}
          width={1024}
          createForParentMesh
          generateMipMaps={true}
          samplingMode={Texture.TRILINEAR_SAMPLINGMODE}
        >
          <rectangle
            thickness={0}
            height={"1024px"}
            width={"1024px"}
            horizontalAlignment="left"
            verticalAlignment="top"
            paddingTop="30px"
            paddingLeft="30px"
          >
            <textBlock
              text={text}
              fontStyle="bold"
              fontSize={30}
              textHorizontalAlignment="left"
              color="white"
            />
          </rectangle>
        </advancedDynamicTexture>
      </plane>
      {/* <adtFullscreenUi name="ui"></adtFullscreenUi> */}
    </>
  );
};
export default Gui;
