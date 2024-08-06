import { ConnectKitButton } from "connectkit";

import styled from "styled-components";
const StyledButton = styled.button`
  cursor: pointer;
  position: relative;
  display: inline-block;
  padding: 4px 56px;
  color: #ffffff;
  font-size: 24px;
  font-weight: 500;
  border: 2px solid;
  border-radius: 0.5rem;
`;

export const ConnectWallet = ({ buttonText = "CONNECT WALLET" }) => {
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, show, truncatedAddress, ensName }) => {
        return (
          <StyledButton onClick={show}>
            {isConnected ? ensName ?? truncatedAddress : buttonText}
          </StyledButton>
        );
      }}
    </ConnectKitButton.Custom>
  );
};
